
import React, { useState, useRef, useEffect } from 'react';
import { AppScreen, ComparisonResult, HistoryItem } from './types';
import { proofreadText } from './geminiService';
import ComparisonTable from './components/ComparisonTable';

// High-fidelity SVG representing the "English Proofreader" logo:
// Includes: Open book, US flag patterns, magnifying glass with check/X marks, and professional typography.
const LOGO_ASSET = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDgwMCA4MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnR3JhZCIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZmZmZmIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2Y4ZmFmYyIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI4MDAiIGZpbGw9InVybCgjYmdHcmFkKSIvPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQwLCAxNTApIj4KICAgIDwhLS0gQm9vayBCYWNrIC0tPgogICAgPHBhdGggZD0iTTEwMCA1MEgyNTBDMjUwIDUwIDI3NSA1MCAyNzUgNzVWMzAwQzI3NSAzMjUgMjUwIDMyNSAyNTAgMzI1SDEwMEMxMDAgMzI1IDc1IDMyNSA3NSAzMDBWNzVDNzUgNTAgMTAwIDUwIDEwMCA1MFoiIGZpbGw9IiMxZTI5M2IiLz4KICAgIDxwYXRoIGQ9Ik01NTAgNTBINC0wQzQwMCA1MCAzNzUgNTAgMzc1IDc1VjMwMEMzNzUgMzI1IDQwMCAzMjUgNDAwIDMyNUg1NTBDNTUwIDMyNSA1NzUgMzI1IDU3NSAzMDBWNzVDNTc1IDUwIDU1MCA1MCA1NTAgNTBaIiBmaWxsPSIjMWUyOTNiIi8+CiAgICAKICAgIDwhLS0gUGFnZXMgLS0+CiAgICA8cGF0aCBkPSJNMTEwIDYwSDI3NUMyNzUgNjAgMjg1IDYwIDI4NSA3MFYzMTBDMjg1IDMyMCAyNzUgMzIwIDI3NSAzMjBIMTEwQzExMCAzMjAgMTAwIDMyMCAxMDAgMzEwVjcwQzEwMCA2MCAxMTAgNjAgMTEwIDYwWiIgZmlsbD0id2hpdGUiLz4KICAgIDxwYXRoIGQ9Ik01NDAgNjBIMzc1QzM3NSA2MCAzNjUgNjAgMzY1IDcwVjMxMEMzNjUgMzIwIDM3NSAzMjAgMzc1IDMyMEg1NDBDNTQwIDMyMCA1NTAgMzIwIDU1MCAzMTBWNzBDNTUwIDYwIDU0MCA2MCA1NDAgNjBaIiBmaWxsPSJ3aGl0ZSIvPgogICAgCiAgICA8IS0tIEZsYWcgUGF0dGVybiBMZWZ0IC0tPgogICAgPHJlY3QgeD0iMTE1IiB5PSI3MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMGUyMDY0Ii8+CiAgICA8ZyBmaWxsPSIjZGUyMDEzIj4KICAgICAgPHJlY3QgeD0iMTk1IiB5PSI3MCIgd2lkdGg9Ijc1IiBoZWlnaHQ9IjciLz4KICAgICAgPHJlY3QgeD0iMTk1IiB5PSI4NCIgd2lkdGg9Ijc1IiBoZWlnaHQ9IjciLz4KICAgICAgPHJlY3QgeD0iMTk1IiB5PSI5OCIgd2lkdGg9Ijc1IiBoZWlnaHQ9IjciLz4KICAgICAgPHJlY3QgeD0iMTk1IiB5PSIxMTIiIHdpZHRoPSI3NSIgaGVpZ2h0PSI4Ii8+CiAgICAgIDxyZWN0IHg9IjExNSIgeT0iMTI1IiB3aWR0aD0iMTU1IiBoZWlnaHQ9IjciLz4KICAgICAgPHJlY3QgeD0iMTE1IiB5PSIxMzkiIHdpZHRoPSIxNTUiIGhlaWdodD0iNyIvPgogICAgICA8cmVjdCB4PSIxMTUiIHk9IjE1MyIgd2lkdGg9IjE1NSIgaGVpZ2h0PSI3Ii8+CiAgICAgIDxyZWN0IHg9IjExNSIgeT0iMTY3IiB3aWR0aD0iMTU1IiBoZWlnaHQ9IjciLz4KICAgIDwvZz4KICAgIAogICAgPCEtLSBNYWduaWZ5aW5nIEdsYXNzIC0tPgogICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjg1LCAxNjApIj4KICAgICAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNjAiIGZpbGw9IndoaXRlIiBzdHJva2U9IiMxZTI5M2IiIHN0cm9rZS13aWR0aD0iOCIvPgogICAgICA8bGluZSB4MT0iOTIiIHkxPSI5MiIgeDI9IjE0MCIgeTI9IjE0MCIgc3Ryb2tlPSIjMWUyOTNiIiBzdHJva2Utd2lkdGg9IjIwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgICAgPHBhdGggZD0iTTMwIDUwbDEwIDEwbDIwLTIwIiBzdHJva2U9IiMyMmI0ODkiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIi8+CiAgICAgIDxwYXRoIGQ9Ik01NSA0NWwyMCAyME03NSA0NWwtMjAgMjAiIHN0cm9rZT0iI2U1MjEyZSIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiIGZpbGw9Im5vbmUiLz4KICAgIDwvZz4KICAgIAogICAgPCEtLSBUZXh0IC0tPgogICAgPHRleHQgeD0iMzEwIiB5PSIzOTAiIGZpbGw9IiMxZTMzNWIiIGZvbnQtZmFtaWx5PSJBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmIiBmb250LXNpemU9Ijg1IiBmb250LXdlaWdodD0iYm9sZCI+RW5nbGlzaDwvdGV4dD4KICAgIDx0ZXh0IHg9IjMxMCIgeT0iNDgwIiBmaWxsPSIjZGUyMDEzIiBmb250LWZhbWlseT0iQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4NCIgZm9udC13ZWlnaHQ9ImJvbGQiPlByb29mcmVhZGVyPC90ZXh0PgogIDwvZz4KPC9zdmc+`;

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.SPLASH);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    setScreen(AppScreen.CHAT);
  };

  const handleReset = () => {
    setScreen(AppScreen.SPLASH);
    setResult(null);
    setInputValue('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);
    const originalText = inputValue;

    try {
      const proofread = await proofreadText(originalText);
      const newResult = { original: originalText, proofread };
      setResult(newResult);
      setScreen(AppScreen.RESULT);
      
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        original: originalText,
        proofread,
        timestamp: Date.now()
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (error) {
      alert("Something went wrong during proofreading. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  // Splash Screen View
  if (screen === AppScreen.SPLASH) {
    return (
      <div className="min-h-screen bg-[#004d57] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="absolute top-4 left-4 cursor-pointer" onClick={handleReset}>
          <i className="fa-solid fa-arrows-rotate text-lg opacity-60 hover:opacity-100 transition-opacity"></i>
        </div>
        
        <div className="w-full max-w-2xl bg-white rounded-2xl p-12 shadow-2xl mb-12 flex flex-col items-center border border-white/10">
          <div className="relative mb-8 group">
            {/* The container is 320px x 320px (w-80 h-80). The img is set to object-cover to fully fill this square. */}
            <div className="bg-white overflow-hidden rounded-xl transition-transform duration-500 group-hover:scale-105 w-80 h-80 shadow-sm border border-gray-100 flex items-center justify-center">
               <img 
                src={LOGO_ASSET}
                alt="English Proofreader Logo" 
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-4 mb-2">
              <div className="relative w-14 h-14 flex items-center justify-center bg-[#004d57]/5 rounded-full">
                <i className="fa-solid fa-pen-nib text-3xl text-[#004d57]"></i>
                <i className="fa-solid fa-check text-xl text-green-500 absolute top-0 right-0"></i>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-extrabold text-[#004d57] tracking-tight leading-none">English</h1>
                <h1 className="text-3xl font-extrabold text-red-600 tracking-tight leading-none">Proofreader</h1>
              </div>
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Professional Editor v3.0</span>
          </div>
        </div>

        <h2 className="text-4xl font-semibold mb-4 tracking-tight">Publication-Ready Content</h2>
        <p className="text-[#a5f3fc]/80 text-xl mb-8 font-light max-w-xl">
          Refine your writing for clarity, precision, and enterprise standards while preserving your unique voice.
        </p>

        <button 
          onClick={handleStart}
          className="group relative flex items-center gap-3 px-16 py-5 bg-[#a5f3fc] hover:bg-white text-[#004d57] font-bold rounded-full text-xl transition-all duration-300 shadow-[0_0_20px_rgba(165,243,252,0.3)] hover:shadow-[0_0_30px_rgba(165,243,252,0.5)] hover:-translate-y-1"
        >
          <i className="fa-solid fa-bolt-lightning text-sm text-yellow-500"></i>
          Get Started
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#004d57] flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#a5f3fc]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-red-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header Bar */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 bg-[#004d57]/80">
        <button onClick={handleReset} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-[#004d57] transition-all">
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </div>
          <span className="text-white/60 text-sm font-medium group-hover:text-white transition-colors">Back</span>
        </button>
        
        <div className="flex-1 max-w-md mx-8 flex items-center gap-4">
          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full bg-[#a5f3fc] transition-all duration-700 ${isLoading ? 'w-2/3 animate-pulse' : result ? 'w-full' : 'w-0'}`}></div>
          </div>
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest whitespace-nowrap">
            {isLoading ? 'Processing' : result ? 'Refinement Complete' : 'Awaiting Input'}
          </span>
        </div>

        <div className="flex items-center gap-3">
           <div className="hidden md:flex flex-col items-end">
             <span className="text-xs font-bold text-white">English Proofreader</span>
             <span className="text-[9px] text-white/40 uppercase">Professional Mode</span>
           </div>
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a5f3fc] to-[#004d57] border-2 border-white/20 flex items-center justify-center shadow-lg">
             <i className="fa-solid fa-user-tie text-[#004d57]"></i>
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-12 flex flex-col items-center pb-40">
        {screen === AppScreen.CHAT && !isLoading && (
          <div className="max-w-2xl w-full flex flex-col items-center justify-center my-auto animate-in fade-in zoom-in duration-1000">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10 shadow-inner">
              <i className="fa-solid fa-quote-left text-3xl text-[#a5f3fc]/40"></i>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">What shall we polish today?</h2>
            <p className="text-white/40 text-lg">Paste your text below for professional refinement.</p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center my-auto animate-in fade-in duration-300 bg-white/5 p-16 rounded-3xl border border-white/10 backdrop-blur-sm">
            <div className="relative">
              <div className="w-24 h-24 border-2 border-[#a5f3fc]/20 border-t-[#a5f3fc] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-wand-magic-sparkles text-2xl text-[#a5f3fc] animate-pulse"></i>
              </div>
            </div>
            <p className="text-white/90 text-xl font-medium mt-8">Applying Professional Edits</p>
            <div className="flex gap-1 mt-3">
              <span className="w-1 h-1 rounded-full bg-[#a5f3fc] animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1 h-1 rounded-full bg-[#a5f3fc] animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1 h-1 rounded-full bg-[#a5f3fc] animate-bounce"></span>
            </div>
          </div>
        )}

        {screen === AppScreen.RESULT && result && !isLoading && (
          <div className="w-full max-w-6xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Comparison Result</h3>
                <p className="text-[#a5f3fc]/60 text-lg">Review the refinements and copy to your document.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setScreen(AppScreen.CHAT)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-white/10"
                >
                  <i className="fa-solid fa-plus"></i> New Text
                </button>
              </div>
            </div>

            <ComparisonTable original={result.original} proofread={result.proofread} />
            
            <div className="flex flex-col items-center gap-4 py-8 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <i className="fa-solid fa-shield-halved"></i>
                <span>Enterprise grade encryption & privacy active</span>
              </div>
              <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">Disclaimer: AI assistance may require human verification for critical documents.</p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Input */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 md:p-10 transition-transform duration-500 ${screen === AppScreen.RESULT && !isLoading ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <form 
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="w-full bg-[#1e1e1e]/95 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden focus-within:ring-4 focus-within:ring-[#a5f3fc]/20 transition-all duration-500">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste the text you want to refine..."
              className="w-full bg-transparent text-white px-8 py-6 outline-none resize-none min-h-[80px] max-h-[400px] text-lg font-light leading-relaxed placeholder:text-white/20"
              rows={Math.min(12, inputValue.split('\n').length + 2)}
            />
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-black/20">
              <div className="flex items-center gap-4">
                <button type="button" className="group flex items-center gap-2 text-white/40 hover:text-[#a5f3fc] transition-colors">
                  <i className="fa-solid fa-paperclip text-lg group-hover:rotate-12 transition-transform"></i>
                  <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Attach</span>
                </button>
                <div className="w-px h-4 bg-white/10 mx-2"></div>
                <button type="button" className="text-white/40 hover:text-[#a5f3fc] transition-colors">
                  <i className="fa-solid fa-microphone text-lg"></i>
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end text-[10px] font-bold text-white/20 tracking-tighter uppercase leading-none mr-2">
                  <span>Ctrl + Enter</span>
                  <span>to process</span>
                </div>
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className={`relative overflow-hidden px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg disabled:opacity-20 disabled:cursor-not-allowed ${
                    isLoading ? 'bg-gray-700 text-white' : 'bg-[#a5f3fc] text-[#004d57] hover:bg-white hover:scale-105 active:scale-95'
                  }`}
                >
                  {isLoading ? (
                    <i className="fa-solid fa-spinner animate-spin"></i>
                  ) : (
                    <>
                      <span>Refine</span>
                      <i className="fa-solid fa-sparkles text-xs"></i>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
