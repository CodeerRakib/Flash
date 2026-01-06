
import React, { useState, useEffect, useRef } from 'react';

interface PythonLabProps {
  codeToRun?: string;
}

const PythonLab: React.FC<PythonLabProps> = ({ codeToRun }) => {
  const [output, setOutput] = useState<string[]>(['>>> Python Kernel 3.11 Initialized...', '>>> Ready for input, sir.']);
  const [inputCode, setInputCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const pyodideRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initPyodide() {
      if (!(window as any).loadPyodide) return;
      pyodideRef.current = await (window as any).loadPyodide();
      setOutput(prev => [...prev, '>>> Pyodide Runtime Loaded.']);
    }
    initPyodide();
  }, []);

  useEffect(() => {
    if (codeToRun) {
      setInputCode(codeToRun);
      runPython(codeToRun);
    }
  }, [codeToRun]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  const runPython = async (code: string) => {
    if (!pyodideRef.current) return;
    setIsRunning(true);
    setOutput(prev => [...prev, `[RUNNING SESSION]`]);
    
    try {
      // Capture stdout
      pyodideRef.current.runPython(`
import sys
import io
sys.stdout = io.String()
      `);
      
      const result = await pyodideRef.current.runPythonAsync(code);
      const stdout = pyodideRef.current.runPython("sys.stdout.getvalue()");
      
      if (stdout) setOutput(prev => [...prev, stdout]);
      if (result !== undefined) setOutput(prev => [...prev, `=> ${result}`]);
    } catch (err: any) {
      setOutput(prev => [...prev, `ERR: ${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="glass-panel flex-1 rounded-2xl flex flex-col overflow-hidden border-yellow-500/20 shadow-[0_0_40px_rgba(234,179,8,0.05)]">
      <div className="p-3 border-b border-white/5 flex items-center justify-between bg-zinc-900/40">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-yellow-500/80">PYTHON_LAB_v1.0</span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => runPython(inputCode)}
            disabled={isRunning}
            className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
          >
            {isRunning ? 'EXECUTING...' : 'EXECUTE_CORE'}
          </button>
          <button 
            onClick={() => setOutput([])}
            className="px-3 py-1 bg-zinc-800 text-zinc-500 text-[10px] font-bold rounded border border-white/5"
          >
            CLEAR
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 space-y-4">
        <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-3 flex flex-col font-mono">
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="# Write Python code here, sir..."
            className="w-full flex-1 bg-transparent text-emerald-400 text-xs outline-none resize-none placeholder:text-zinc-700"
          />
        </div>

        <div className="h-40 bg-zinc-950/80 rounded-xl border border-white/5 p-3 font-mono text-[10px] overflow-hidden flex flex-col">
          <div className="text-zinc-500 mb-2 border-b border-white/5 pb-1">KERNEL_OUTPUT</div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
            {output.map((line, i) => (
              <div key={i} className={`${line.startsWith('ERR') ? 'text-red-400' : 'text-zinc-400'}`}>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonLab;
