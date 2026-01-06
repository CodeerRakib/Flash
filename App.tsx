
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { SystemStatus, TranscriptEntry } from './types';
import { saveTranscript, fetchTranscripts } from './supabase';
import Header from './components/Header';
import VisualInput from './components/VisualInput';
import SystemMetrics from './components/SystemMetrics';
import CoreSystem from './components/CoreSystem';
import Transcript from './components/Transcript';
import Controls from './components/Controls';
import WeatherWidget from './components/WeatherWidget';
import UptimeWidget from './components/UptimeWidget';

const FLASH_SYSTEM_INSTRUCTION = `You are FLASH, an advanced personal AI assistant. 
Your personality: 
- Professional, butler-like, witty, and highly intelligent.
- Proactive and focused on serving "Sir" or "Ma'am".
- Respond in the language used by the user (English, Bangla, or Hindi).`;

const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.ONLINE);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isFlashSpeaking, setIsFlashSpeaking] = useState(false);
  const [isListeningForWakeWord, setIsListeningForWakeWord] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const [cpu, setCpu] = useState(8);
  const [uptime, setUptime] = useState(439);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await fetchTranscripts();
      if (history.length > 0) setTranscript(history);
    };
    loadHistory();

    const interval = setInterval(() => {
      setCpu(prev => Math.min(100, Math.max(5, prev + (Math.random() * 4 - 2))));
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTranscript = useCallback(async (role: 'user' | 'flash', text: string) => {
    const newEntry: TranscriptEntry = { role, text, timestamp: new Date() };
    setTranscript(prev => [...prev, newEntry]);
    await saveTranscript(role, text);
  }, []);

  const startLiveSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);
      let fMsg = ''; let uMsg = '';

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setIsListeningForWakeWord(false);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const data = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(data.length);
              for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
              const binary = String.fromCharCode(...new Uint8Array(int16.buffer));
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg) => {
            if (msg.serverContent?.outputTranscription) fMsg += msg.serverContent.outputTranscription.text;
            if (msg.serverContent?.inputTranscription) uMsg += msg.serverContent.inputTranscription.text;
            if (msg.serverContent?.turnComplete) {
              if (uMsg) addTranscript('user', uMsg);
              if (fMsg) addTranscript('flash', fMsg);
              uMsg = ''; fMsg = '';
            }
            const audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio) {
              setIsFlashSpeaking(true);
              const bytes = new Uint8Array(atob(audio).split('').map(c => c.charCodeAt(0)));
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await (async () => {
                const dataInt16 = new Int16Array(bytes.buffer);
                const b = outputCtx.createBuffer(1, dataInt16.length, 24000);
                const cd = b.getChannelData(0);
                for (let i = 0; i < dataInt16.length; i++) cd[i] = dataInt16[i] / 32768.0;
                return b;
              })();
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNode);
              source.onended = () => { sourcesRef.current.delete(source); if (sourcesRef.current.size === 0) setIsFlashSpeaking(false); };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onclose: () => { setIsLive(false); setIsListeningForWakeWord(true); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: FLASH_SYSTEM_INSTRUCTION,
          inputAudioTranscription: {}, outputAudioTranscription: {}
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (e) { console.error(e); }
  };

  return (
    <div className="h-screen w-screen flex flex-col p-4 lg:p-6 overflow-hidden relative bg-[#010406]">
      <div className="scanline" />
      <Header status={status} />
      
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden mt-4">
        {/* Left column as per image */}
        <div className="lg:col-span-3 flex flex-col space-y-4 overflow-y-auto no-scrollbar">
          <SystemMetrics cpu={cpu} ram={7} />
          <WeatherWidget />
          <VisualInput active={cameraActive} />
          <UptimeWidget uptime={uptime} />
        </div>

        {/* Center column as per image */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          <CoreSystem isListening={isListeningForWakeWord} isSpeaking={isFlashSpeaking} />
          
          <div className="mt-4 flex flex-col items-center">
            <h1 className="text-4xl font-hud font-black text-zinc-100 tracking-[0.5em] mb-2">F.L.A.S.H</h1>
            <div className="bg-black/60 border border-white/5 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_#22d3ee]" />
              <span className="text-[10px] font-hud text-cyan-400/80 tracking-widest">
                {isListeningForWakeWord ? 'Listening for wake word...' : 'Voice Protocol Active'}
              </span>
            </div>
          </div>

          <div className="absolute bottom-10">
            <Controls 
              isLive={isLive} 
              onStart={startLiveSession} 
              onEnd={() => sessionPromiseRef.current?.then(s => s.close())}
              cameraActive={cameraActive} 
              setCameraActive={setCameraActive}
            />
          </div>
        </div>

        {/* Right column as per image */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <Transcript entries={transcript} />
        </div>
      </main>
    </div>
  );
};

export default App;
