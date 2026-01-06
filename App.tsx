
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { SystemStatus, TranscriptEntry, ProcessInfo } from './types';
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
- You are modeled after high-end AI assistants like Jarvis, but with a warm female persona.`;

const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.ONLINE);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(prev => Math.min(100, Math.max(0.5, prev + (Math.random() * 2 - 1))));
      setRamUsage(prev => Math.min(100, Math.max(10, prev + (Math.random() * 0.1 - 0.05))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const addTranscript = useCallback((role: 'user' | 'flash', text: string) => {
    setTranscript(prev => [...prev, { role, text, timestamp: new Date() }]);
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

  // Standard encoding logic for raw PCM data to Gemini Live API
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
      // Create a new GoogleGenAI instance inside the start session function as per guidelines
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
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`, do not add other condition checks.
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

  const toggleHandsFree = async () => {
    if (!handsFreeEnabled) {
      try { await navigator.mediaDevices.getUserMedia({ audio: true }); setHandsFreeEnabled(true); } 
      catch (err) { console.error("Flash requires microphone access."); }
    } else setHandsFreeEnabled(false);
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
        {/* Left Column */}
        <div className={`
          lg:col-span-3 lg:flex flex-col space-y-3 h-full overflow-hidden
          ${activeTab === 'VISION' || activeTab === 'METRICS' || activeTab === 'DASHBOARD' ? 'flex flex-1' : 'hidden lg:flex'}
        `}>
          {(activeTab === 'VISION' || activeTab === 'DASHBOARD') && <VisualInput active={cameraActive} />}
          {(activeTab === 'METRICS' || activeTab === 'DASHBOARD') && <SystemMetrics cpu={cpuLoad} ram={ramUsage} processes={processes} />}
        </div>

        {/* Center Column */}
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
                  onToggleHandsFree={toggleHandsFree}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className={`
          lg:col-span-3 h-full overflow-hidden
          ${activeTab === 'LOG' ? 'flex flex-1' : 'hidden lg:flex'}
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
          CREATED WITH <span className="text-red-500">❤️</span> FLASH AI // JARVIS PROTOCOL
        </span>
      </footer>
    </div>
  );
};

export default App;
