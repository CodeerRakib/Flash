
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
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

const FLASH_SYSTEM_INSTRUCTION = `You are FLASH, an advanced personal AI assistant inspired by JARVIS.
Personality: Professional, butler-like, witty, and highly efficient.
Always address the user as 'Sir' or 'Ma'am'.
Keep responses concise and helpful.`;

const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.ONLINE);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isFlashSpeaking, setIsFlashSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const [cpu, setCpu] = useState(8);
  const [uptime, setUptime] = useState(439);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const text = lastResult[0].transcript.trim();
          handleUserInput(text);
        }
      };

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        if (isLive) recognition.start(); // Keep listening if active
        else setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

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
  }, [isLive]);

  const speak = (text: string) => {
    // Cancel any current speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a Jarvis-like voice (British Male)
    const voices = synthRef.current.getVoices();
    const jarvisVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel') || v.lang === 'en-GB');
    if (jarvisVoice) utterance.voice = jarvisVoice;
    
    utterance.pitch = 0.9;
    utterance.rate = 1.0;

    utterance.onstart = () => setIsFlashSpeaking(true);
    utterance.onend = () => setIsFlashSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const handleUserInput = async (text: string) => {
    if (!text) return;
    
    addTranscript('user', text);
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: text,
        config: { systemInstruction: FLASH_SYSTEM_INSTRUCTION }
      });

      const reply = response.text || "I'm sorry, Sir, I couldn't process that.";
      addTranscript('flash', reply);
      speak(reply);
    } catch (error) {
      console.error("AI Error:", error);
      speak("System error encountered, Sir. Please check my credentials.");
    } finally {
      setIsThinking(false);
    }
  };

  const addTranscript = useCallback(async (role: 'user' | 'flash', text: string) => {
    const newEntry: TranscriptEntry = { role, text, timestamp: new Date() };
    setTranscript(prev => [...prev, newEntry]);
    await saveTranscript(role, text);
  }, []);

  const toggleVoiceSystem = () => {
    if (isLive) {
      recognitionRef.current?.stop();
      synthRef.current.cancel();
      setIsLive(false);
    } else {
      recognitionRef.current?.start();
      setIsLive(true);
      speak("Systems online. At your service, Sir.");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col p-4 lg:p-6 overflow-hidden relative bg-[#010406]">
      <div className="scanline" />
      <Header status={isLive ? SystemStatus.ONLINE : SystemStatus.OFFLINE} />
      
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden mt-4">
        <div className="lg:col-span-3 flex flex-col space-y-4 overflow-y-auto no-scrollbar">
          <SystemMetrics cpu={cpu} ram={7} />
          <WeatherWidget />
          <VisualInput active={cameraActive} />
          <UptimeWidget uptime={uptime} />
        </div>

        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          <CoreSystem isListening={isListening} isSpeaking={isFlashSpeaking} isProcessing={isThinking} />
          
          <div className="mt-4 flex flex-col items-center">
            <h1 className="text-4xl font-hud font-black text-zinc-100 tracking-[0.5em] mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">F.L.A.S.H</h1>
            <div className="bg-black/60 border border-white/5 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <div className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-cyan-400 animate-pulse shadow-[0_0_5px_#22d3ee]' : 'bg-zinc-700'}`} />
              <span className="text-[10px] font-hud text-cyan-400/80 tracking-widest uppercase">
                {isThinking ? 'Processing...' : isLive ? 'Listening...' : 'Systems Standby'}
              </span>
            </div>
          </div>

          <div className="absolute bottom-10">
            <Controls 
              isLive={isLive} 
              onStart={toggleVoiceSystem} 
              onEnd={toggleVoiceSystem}
              cameraActive={cameraActive} 
              setCameraActive={setCameraActive}
            />
          </div>
        </div>

        <div className="lg:col-span-3 h-full overflow-hidden">
          <Transcript entries={transcript} />
        </div>
      </main>
    </div>
  );
};

export default App;
