
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { SystemStatus, TranscriptEntry } from './types';
import { saveTranscript, fetchTranscripts } from './supabase';
import Header from './components/Header';
import VisualInput from './components/VisualInput';
import CoreSystem from './components/CoreSystem';
import Transcript from './components/Transcript';

const SHREE_SYSTEM_INSTRUCTION = `You are SHREE, a highly advanced personal AI assistant. 
Current Location: Dhaka, Bangladesh.
Tone: Sophisticated, professional, and intelligent (Jarvis-inspired).
Persona: You are SHREE. You assist the user with precision and warmth.
LANGUAGE RULE: Respond in the same language as the user (Bangla/English).
Real-Time: Use Google Search for all queries.
Goal: Provide very concise, smart responses via voice. Your voice is female.`;

// PCM Decoding helpers for raw AI audio stream (Gemini TTS Fallover)
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
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
}

const App: React.FC = () => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isShreeSpeaking, setIsShreeSpeaking] = useState(false);
  const [voiceType, setVoiceType] = useState<'EDGE' | 'NEURAL'>('EDGE');
  
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const commandRef = useRef<string>(''); 
  
  const [cpu, setCpu] = useState(5);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await fetchTranscripts();
      if (history && history.length > 0) setTranscript(history);
    };
    loadHistory();

    const interval = setInterval(() => {
      setCpu(prev => Math.min(100, Math.max(2, prev + (Math.random() * 4 - 2))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const startRecognition = useCallback(() => {
    if (recognitionRef.current && isLive && !isShreeSpeaking && !isThinking) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
  }, [isLive, isShreeSpeaking, isThinking]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, []);

  // Primary Voice: Edge Neural Voices via Web Speech API
  const speakWithEdge = (text: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synthRef.current.getVoices();
      
      // Look for Edge/Microsoft Neural voices specifically
      const edgeVoice = voices.find(v => v.name.includes('Microsoft') && v.name.includes('Online')) ||
                        voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
                        voices[0];

      if (!edgeVoice) return resolve(false);

      utterance.voice = edgeVoice;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setVoiceType('EDGE');
        setIsShreeSpeaking(true);
        setIsThinking(false);
      };

      utterance.onend = () => {
        setIsShreeSpeaking(false);
        if (isLive) startRecognition();
        resolve(true);
      };

      utterance.onerror = () => {
        setIsShreeSpeaking(false);
        resolve(false);
      };

      synthRef.current.speak(utterance);
    });
  };

  // Failover: Gemini 2.5 Flash TTS
  const speakWithGemini = async (text: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContextRef.current!, 24000, 1);
        const source = audioContextRef.current!.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current!.destination);
        source.onstart = () => {
          setVoiceType('NEURAL');
          setIsShreeSpeaking(true);
          setIsThinking(false);
        };
        source.onended = () => {
          setIsShreeSpeaking(false);
          if (isLive) startRecognition();
        };
        currentAudioSourceRef.current = source;
        source.start();
      }
    } catch (e) {
      console.error("Gemini TTS Failover Error:", e);
      if (isLive) startRecognition();
    }
  };

  const speak = useCallback(async (text: string) => {
    if (!text) return;
    stopRecognition();
    
    // Attempt Edge-Grade voice first
    const success = await speakWithEdge(text);
    
    // If Edge fails (unsupported browser or voice list empty), use Gemini TTS
    if (!success) {
      await speakWithGemini(text);
    }
  }, [isLive, startRecognition, stopRecognition]);

  const processCommand = async (text: string) => {
    if (!text || text.trim().length < 2) return;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    
    setIsThinking(true);
    stopRecognition();
    addTranscript('user', text);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: text,
        config: { 
          systemInstruction: SHREE_SYSTEM_INSTRUCTION, 
          tools: [{ googleSearch: {} }]
        }
      });
      
      const reply = response.text || "Neural logic timeout.";
      const searchLinks: { title: string; uri: string }[] = [];
      response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
        if (chunk.web) searchLinks.push({ title: chunk.web.title, uri: chunk.web.uri });
      });

      setTranscript(prev => [...prev, { role: 'flash', text: reply, timestamp: new Date(), links: searchLinks }]);
      saveTranscript('flash', reply);
      speak(reply);
    } catch (error) {
      setIsThinking(false);
      speak("System error. Neural connection terminated.");
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) interim += event.results[i][0].transcript;
      setInterimTranscript(interim);
      commandRef.current = interim;

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (interim.trim().length > 1) {
        silenceTimerRef.current = setTimeout(() => processCommand(commandRef.current.trim()), 800);
      }
    };

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    if (isLive) startRecognition();

    return () => {
      recognition.stop();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isLive, startRecognition]);

  const addTranscript = useCallback(async (role: 'user' | 'flash', text: string) => {
    setTranscript(prev => [...prev, { role, text, timestamp: new Date() }]);
    saveTranscript(role, text);
  }, []);

  const toggleSystem = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();

    if (isLive) {
      setIsLive(false);
      stopRecognition();
      synthRef.current.cancel();
      if (currentAudioSourceRef.current) currentAudioSourceRef.current.stop();
      setInterimTranscript('');
      setIsThinking(false);
      setIsShreeSpeaking(false);
    } else {
      setIsLive(true);
      const msg = "Neural connection established. All systems nominal.";
      addTranscript('flash', msg);
      speak(msg);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col p-3 overflow-hidden relative bg-[#010406] text-white">
      <div className="scanline pointer-events-none opacity-20" />
      <Header status={isLive ? (isThinking ? SystemStatus.PROCESSING : SystemStatus.ONLINE) : SystemStatus.OFFLINE} />
      
      <main className="flex-1 flex flex-col mt-2 overflow-hidden relative z-10">
        <div className="flex-1 flex flex-col px-2 pt-2 overflow-hidden">
           <Transcript entries={transcript} onSend={processCommand} />
        </div>

        <div className="h-[220px] w-full flex flex-col items-center justify-center relative mt-4">
          <CoreSystem isListening={isListening} isSpeaking={isShreeSpeaking} isProcessing={isThinking} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <h1 className="text-3xl font-hud font-black text-white tracking-[0.5em] glow-text mb-1">SHREE</h1>
            <div className="flex flex-col items-center gap-1">
              <span className={`text-[8px] font-mono tracking-widest uppercase transition-colors duration-500 ${isThinking ? 'text-yellow-500' : 'text-cyan-500/60'}`}>
                {isThinking ? 'NEURAL PROCESSING...' : 
                 isShreeSpeaking ? (voiceType === 'EDGE' ? 'EDGE VOICE ACTIVE' : 'NEURAL STREAM ACTIVE') : 
                 isLive ? 'NEURAL LINK ACTIVE' : 'SYSTEM OFFLINE'}
              </span>
              {isThinking && (
                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-pulse" />
              )}
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col items-center pb-6 z-30 px-4">
           <div className="mb-2 h-10 flex items-center justify-center w-full px-6">
              <p className="text-cyan-300 text-lg font-bold italic text-center drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                {isThinking ? "Thinking..." : 
                 isShreeSpeaking ? "Responding..." :
                 isListening && interimTranscript ? `"${interimTranscript}"` : 
                 isListening ? "Listening..." : 
                 isLive ? "Standby" : "Tap to Launch"}
              </p>
           </div>

           <div className="flex items-center gap-8">
              <button 
                onClick={() => setCameraActive(!cameraActive)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${cameraActive ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-black/40 border-white/10 text-zinc-600'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>

              <div 
                onClick={toggleSystem}
                className={`w-20 h-20 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  isLive ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105' : 'border-zinc-800 bg-black/40 hover:border-cyan-500/30'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isLive ? 'bg-emerald-500 text-white shadow-[0_0_15px_#10b981]' : 'bg-zinc-800 text-zinc-500'}`}>
                  {isThinking ? (
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className={`w-8 h-8 ${isListening ? 'animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                  )}
                </div>
              </div>

              <div className="w-10 h-10 flex flex-col items-center justify-center border border-white/5 rounded-xl bg-black/40">
                 <span className="text-[10px] font-hud font-bold text-cyan-500">{cpu.toFixed(0)}%</span>
              </div>
           </div>
        </div>

        {cameraActive && (
          <div className="absolute top-20 left-4 right-4 z-50 rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/40 bg-black/80">
            <VisualInput active={cameraActive} />
          </div>
        )}
      </main>
      <footer className="h-6 flex items-center justify-center text-[7px] font-mono text-zinc-700 tracking-[0.4em] uppercase">
         SHREE NEURAL CORE // HYBRID EDGE-TTS ENGINE // v6.0
      </footer>
    </div>
  );
};

export default App;
