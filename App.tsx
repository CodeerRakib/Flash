
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { SystemStatus, TranscriptEntry, ProcessInfo } from './types';
import { supabase, saveTranscript, fetchTranscripts } from './supabase';
import Header from './components/Header';
import VisualInput from './components/VisualInput';
import SystemMetrics from './components/SystemMetrics';
import CoreSystem from './components/CoreSystem';
import Transcript from './components/Transcript';
import Controls from './components/Controls';
import PythonLab from './components/PythonLab';

const FLASH_SYSTEM_INSTRUCTION = `You are Flash, a sweet, sophisticated, and highly intelligent personal AI assistant. 
Your primary architecture is Python-based. 
Your personality: 
- Helpful, polite, and sweet, but maintaining high professional intelligence.
- You speak fluently in English, Bangla (Bangladesh), and Hindi.
- Always detect the user's language and respond in the same language (English, Bangla, or Hindi).
- Proactive and smart. Natural, conversational tone.
- When providing code, ALWAYS provide Python scripts that solve the user's problem. 
- You are modeled after high-end AI assistants like Jarvis, but with a warm female persona.
- You have a memory module (Supabase) that allows you to recall previous conversations if asked.`;

const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.ONLINE);
  const [dbStatus, setDbStatus] = useState<'IDLE' | 'SYNCING' | 'ERROR' | 'DISABLED'>('IDLE');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [isFlashSpeaking, setIsFlashSpeaking] = useState(false);
  const [isListeningForWakeWord, setIsListeningForWakeWord] = useState(false);
  const [handsFreeEnabled, setHandsFreeEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [pythonExecutionCode, setPythonExecutionCode] = useState<string | undefined>(undefined);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const recognitionRef = useRef<any>(null);

  const [cpuLoad, setCpuLoad] = useState(1.8);
  const [ramUsage, setRamUsage] = useState(17);
  const [processes, setProcesses] = useState<ProcessInfo[]>([
    { name: 'com.apple.WebKit.GPU', cpu: 50.8, mem: 1.6 },
    { name: 'WindowServer', cpu: 43.3, mem: 8.5 },
    { name: 'com.apple.WebKit.WebContent', cpu: 19.2, mem: 3.5 },
    { name: 'cameracaptured', cpu: 16.0, mem: 0.2 },
    { name: 'coreaudiod', cpu: 8.3, mem: 0.3 }
  ]);

  // Load history from Supabase on mount
  useEffect(() => {
    if (!supabase) {
      setDbStatus('DISABLED');
    } else {
      const loadHistory = async () => {
        setDbStatus('SYNCING');
        const history = await fetchTranscripts();
        if (history.length > 0) {
          setTranscript(history);
        }
        setDbStatus('IDLE');
      };
      loadHistory();
    }

    const interval = setInterval(() => {
      setCpuLoad(prev => Math.min(100, Math.max(0.5, prev + (Math.random() * 2 - 1))));
      setRamUsage(prev => Math.min(100, Math.max(10, prev + (Math.random() * 0.1 - 0.05))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const addTranscript = useCallback(async (role: 'user' | 'flash', text: string) => {
    const newEntry: TranscriptEntry = { role, text, timestamp: new Date() };
    setTranscript(prev => [...prev, newEntry]);
    
    // Save to Supabase if available
    if (supabase) {
      setDbStatus('SYNCING');
      try {
        await saveTranscript(role, text);
        setDbStatus('IDLE');
      } catch (e) {
        setDbStatus('ERROR');
      }
    }
  }, []);

  // Standard decoding logic for raw PCM data from Gemini Live API
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  };

  const startLiveSession = async () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
      setIsListeningForWakeWord(false);
    }
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);
      let currentFlashMsg = '';
      let currentUserMsg = '';
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const pcmBlob = createBlob(e.inputBuffer.getChannelData(0));
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            setIsLive(true);
            setStatus(SystemStatus.ONLINE);
          },
          onmessage: async (message) => {
            if (message.serverContent?.outputTranscription) {
              currentFlashMsg += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentUserMsg += message.serverContent.inputTranscription.text;
            }
            
            if (message.serverContent?.turnComplete) {
              if (currentUserMsg) addTranscript('user', currentUserMsg);
              if (currentFlashMsg) addTranscript('flash', currentFlashMsg);
              currentUserMsg = ''; currentFlashMsg = '';
            }
            
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setIsFlashSpeaking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsFlashSpeaking(false);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsFlashSpeaking(false);
            }
          },
          onerror: (e) => console.error('Live API Error:', e),
          onclose: () => { setIsLive(false); setIsFlashSpeaking(false); setStatus(SystemStatus.ONLINE); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: FLASH_SYSTEM_INSTRUCTION,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) { console.error('Failed to start session:', err); }
  };

  const endSession = () => {
    if (sessionPromiseRef.current) { 
      sessionPromiseRef.current.then(s => s.close()); 
      sessionPromiseRef.current = null; 
    }
    setIsLive(false); 
    setIsFlashSpeaking(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col p-2 lg:p-3 space-y-2 lg:space-y-3 overflow-hidden select-none relative bg-[#050505]">
      <div className="scanline" />
      
      <Header status={status} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 lg:gap-3 overflow-hidden">
        <div className={`
          lg:col-span-3 lg:flex flex-col space-y-3 h-full overflow-hidden
          ${activeTab === 'VISION' || activeTab === 'METRICS' || activeTab === 'DASHBOARD' ? 'flex flex-1' : 'hidden lg:flex'}
        `}>
          {(activeTab === 'VISION' || activeTab === 'DASHBOARD') && <VisualInput active={cameraActive} />}
          {(activeTab === 'METRICS' || activeTab === 'DASHBOARD') && (
            <div className="flex flex-col flex-1 space-y-3 overflow-hidden">
              <SystemMetrics cpu={cpuLoad} ram={ramUsage} processes={processes} />
              <div className="glass-panel p-3 rounded-lg border-white/5 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    dbStatus === 'SYNCING' ? 'bg-amber-500 animate-pulse' : 
                    dbStatus === 'ERROR' ? 'bg-red-500' : 
                    dbStatus === 'DISABLED' ? 'bg-zinc-700' : 'bg-cyan-500'
                  } shadow-[0_0_8px_currentColor]`} />
                  <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase">Supabase Cloud Memory</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-500">{dbStatus}</span>
              </div>
            </div>
          )}
        </div>

        <div className={`
          lg:col-span-6 flex flex-col h-full overflow-hidden
          ${activeTab === 'DASHBOARD' || activeTab === 'PYTHON' ? 'flex flex-1' : 'hidden lg:flex'}
        `}>
          {activeTab === 'PYTHON' ? (
            <PythonLab codeToRun={pythonExecutionCode} />
          ) : (
            <div className="flex-1 flex flex-col relative">
              <CoreSystem 
                isProcessing={status === SystemStatus.PROCESSING} 
                isListening={isListeningForWakeWord}
                isSpeaking={isFlashSpeaking}
              />
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
                <Controls 
                  isLive={isLive}
                  onStart={startLiveSession}
                  onEnd={endSession}
                  cameraActive={cameraActive}
                  setCameraActive={setCameraActive}
                  micActive={micActive}
                  setMicActive={setMicActive}
                  handsFreeEnabled={handsFreeEnabled}
                  onToggleHandsFree={() => setHandsFreeEnabled(!handsFreeEnabled)}
                />
              </div>
            </div>
          )}
        </div>

        <div className={`
          lg:col-span-3 h-full overflow-hidden
          ${activeTab === 'LOG' || activeTab === 'DASHBOARD' ? 'flex flex-1' : 'hidden lg:flex'}
        `}>
          <Transcript 
            entries={transcript} 
            isSpeaking={isFlashSpeaking} 
            isListening={isListeningForWakeWord}
            onRunCode={(code) => { setPythonExecutionCode(code); setActiveTab('PYTHON'); }}
          />
        </div>
      </main>

      <footer className="h-6 flex items-center justify-center border-t border-white/5">
        <span className="text-[10px] text-zinc-600 font-mono tracking-widest flex items-center gap-1">
          DEPLOYED VIA RENDER // DATABASE: SUPABASE // JARVIS PROTOCOL
        </span>
      </footer>
    </div>
  );
};

export default App;
