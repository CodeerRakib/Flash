
import React, { useState, useEffect, useRef } from 'react';

interface PythonLabProps {
  codeToRun?: string;
}

const PythonLab: React.FC<PythonLabProps> = ({ codeToRun }) => {
  const [output, setOutput] = useState<string[]>(['>>> Python Kernel 3.11 Active', '>>> Node: DHAKA_PRIMARY_DC']);
  const [inputCode, setInputCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const pyodideRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initPyodide() {
      if (!(window as any).loadPyodide) return;
      pyodideRef.current = await (window as any).loadPyodide();
      setOutput(prev => [...prev, '>>> Runtime Ready.']);
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
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [output]);

  const runPython = async (code: string) => {
    if (!pyodideRef.current) return;
    setIsRunning(true);
    setOutput(prev => [...prev, `[INITIATING EXECUTION]`]);
    try {
      pyodideRef.current.runPython(`import sys\nimport io\nsys.stdout = io.StringIO()`);
      const result = await pyodideRef.current.runPythonAsync(code);
      const stdout = pyodideRef.current.runPython("sys.stdout.getvalue()");
      if (stdout) setOutput(prev => [...prev, stdout]);
      if (result !== undefined) setOutput(prev => [...prev, `=> ${result}`]);
    } catch (err: any) {
      setOutput(prev => [...prev, `[ERROR]: ${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="glass-panel flex flex-col h-full border-yellow-500/20 bg-zinc-950/60 shadow-2xl">
      <div className="widget-header !bg-yellow-500/5 !border-yellow-500/20 !text-yellow-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span>PYTHON_LAB_v2</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => runPython(inputCode)}
            disabled={isRunning}
            className="px-4 py-0.5 bg-yellow-500/10 text-yellow-500 text-[9px] font-bold border border-yellow-500/30 hover:bg-yellow-500/20 transition-all uppercase"
          >
            {isRunning ? 'Executing...' : 'Run Code'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden border-t border-white/5">
        <div className="flex-1 p-3 border-r border-white/5">
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="# Input commands or scripts..."
            className="w-full h-full bg-transparent text-yellow-500/80 text-[11px] font-mono outline-none resize-none placeholder:text-zinc-800"
          />
        </div>
        <div className="w-1/3 bg-black/40 flex flex-col p-3 font-mono text-[9px]">
           <div className="text-zinc-600 mb-2 font-bold uppercase tracking-widest border-b border-white/5 pb-1">System Out</div>
           <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 custom-scrollbar text-zinc-400">
             {output.map((line, i) => (
               <div key={i} className={line.includes('[ERROR]') ? 'text-red-400' : ''}>
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
