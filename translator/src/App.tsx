import React, { useState, useRef, useEffect } from 'react';
import { 
  Languages, 
  Upload, 
  FileText, 
  Play, 
  Pause, 
  RotateCcw, 
  DownloadCloud, 
  Zap, 
  Crown, 
  BookOpen, 
  Plus, 
  Trash2, 
  UploadCloud, 
  Database, 
  AlertCircle, 
  Sparkles,
  Key,
  Check,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubtitleItem, GlossaryItem, LogItem, SavedSession } from './types';
import { translations } from './locales';
import { translateTextWithGemini } from './services/geminiService';

export default function App() {
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mode, setMode] = useState<'pro' | 'basic'>('pro');
  
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [targetLang, setTargetLang] = useState<string>('Persian');
  const [style, setStyle] = useState<string>('Conversational');
  
  const [glossary, setGlossary] = useState<GlossaryItem[]>([]);
  const [newSourceTerm, setNewSourceTerm] = useState('');
  const [newTargetTerm, setNewTargetTerm] = useState('');
  
  const [isParallelEnabled, setIsParallelEnabled] = useState(true);
  const [useTmCache, setUseTmCache] = useState(true);
  const [tmCache, setTmCache] = useState<Record<string, string>>({});
  
  const [status, setStatus] = useState<'idle' | 'translating' | 'paused' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogItem[]>([]);
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearTmConfirm, setShowClearTmConfirm] = useState(false);
  const [showClearGlossaryConfirm, setShowClearGlossaryConfirm] = useState(false);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [savedSessionDetails, setSavedSessionDetails] = useState<SavedSession | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];
  const isRtl = lang === 'fa';

  // Add Log Entry
  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newLog: LogItem = {
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Parse SRT File Content
  const parseSRT = (content: string) => {
    const blocks = content.trim().split(/\n\s*\n/);
    const parsed: SubtitleItem[] = [];

    blocks.forEach((block, index) => {
      const lines = block.split('\n');
      if (lines.length >= 3) {
        const timeLine = lines[1];
        const [startTime, endTime] = timeLine.split(' --> ');
        const sourceText = lines.slice(2).join(' ');

        if (startTime && endTime) {
          parsed.push({
            id: index + 1,
            startTime: startTime.trim(),
            endTime: endTime.trim(),
            sourceText: sourceText.trim(),
            translatedText: '',
            status: 'pending'
          });
        }
      }
    });

    return parsed;
  };

  // Handle SRT File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseSRT(text);
      setSubtitles(parsed);
      addLog(`فایل زیرنویس با ${parsed.length} خط بارگذاری شد.`, 'success');
    };
    reader.readAsText(file);
  };

  // Glossary Handlers
  const handleAddTerm = () => {
    if (!newSourceTerm.trim() || !newTargetTerm.trim()) return;
    setGlossary(prev => [...prev, {
      id: Math.random().toString(),
      source: newSourceTerm.trim(),
      target: newTargetTerm.trim()
    }]);
    setNewSourceTerm('');
    setNewTargetTerm('');
  };

  const removeGlossaryEntry = (id: string) => {
    setGlossary(prev => prev.filter(item => item.id !== id));
  };

  // Start Translation Process
  const startTranslation = async (startIndex = 0) => {
    if (!apiKey) {
      alert('لطفاً ابتدا کلید Gemini API را وارد کنید.');
      return;
    }

    setStatus('translating');
    addLog('فرایند ترجمه آغاز شد...', 'info');

    let updatedSubtitles = [...subtitles];

    for (let i = startIndex; i < updatedSubtitles.length; i++) {
      const item = updatedSubtitles[i];
      if (item.status === 'completed') continue;

      try {
        // Check TM Cache first
        if (useTmCache && tmCache[item.sourceText]) {
          updatedSubtitles[i].translatedText = tmCache[item.sourceText];
          updatedSubtitles[i].status = 'completed';
          addLog(`خط ${item.id} از حافظه ترجمه (TM) بازخوانی شد.`, 'info');
        } else {
          // Translate with Gemini
          const translated = await translateTextWithGemini(
            item.sourceText,
            apiKey,
            targetLang,
            style,
            glossary
          );

          updatedSubtitles[i].translatedText = translated;
          updatedSubtitles[i].status = 'completed';

          if (useTmCache) {
            setTmCache(prev => ({ ...prev, [item.sourceText]: translated }));
          }
        }
      } catch (err: any) {
        updatedSubtitles[i].status = 'error';
        addLog(`خطا در ترجمه خط ${item.id}: ${err.message}`, 'error');
      }

      setSubtitles([...updatedSubtitles]);
      setProgress(Math.round(((i + 1) / updatedSubtitles.length) * 100));
    }

    setStatus('completed');
    addLog('ترجمه تمامی خطوط به پایان رسید!', 'success');
  };

  const handlePause = () => {
    setStatus('paused');
    addLog('ترجمه متوقف شد.', 'warning');
  };

  const handleResume = () => {
    const nextPendingIndex = subtitles.findIndex(s => s.status !== 'completed');
    if (nextPendingIndex !== -1) {
      startTranslation(nextPendingIndex);
    }
  };

  // Export SRT File
  const handleDownload = () => {
    let srtContent = '';
    subtitles.forEach(item => {
      srtContent += `${item.id}\n${item.startTime} --> ${item.endTime}\n${item.translatedText || item.sourceText}\n\n`;
    });

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translated_${fileName || 'subtitle.srt'}`;
    link.click();
  };

  const handleResetConfirm = () => {
    setSubtitles([]);
    setFileName('');
    setProgress(0);
    setStatus('idle');
    setLogs([]);
    setShowResetConfirm(false);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0c] text-white' : 'bg-slate-100 text-slate-900'} p-4 md:p-8 font-sans`}>
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6 text-purple-500" />
          <span>مترجم زیرنویس هوشمند Gemini</span>
        </h1>
        <button 
          onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
          className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold"
        >
          {lang === 'fa' ? 'English' : 'فارسی'}
        </button>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        {/* API Key Section */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>کلید Gemini API:</span>
          </label>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white outline-none focus:border-purple-500"
          />
        </div>

        {/* Upload Box */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="p-8 rounded-2xl border-2 border-dashed border-white/20 hover:border-purple-500/50 bg-white/5 text-center cursor-pointer transition-all"
        >
          <Upload className="w-8 h-8 mx-auto text-purple-400 mb-2" />
          <p className="text-sm font-bold">برای انتخاب فایل SRT کلیک کنید</p>
          {fileName && <p className="text-xs text-emerald-400 mt-2">فایل انتخاب شده: {fileName}</p>}
          <input ref={fileInputRef} type="file" accept=".srt" onChange={handleFileUpload} className="hidden" />
        </div>

        {/* Controls & Action Buttons */}
        {subtitles.length > 0 && (
          <div className="flex gap-3">
            {status === 'translating' ? (
              <button onClick={handlePause} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 font-bold rounded-xl text-xs flex items-center justify-center gap-2">
                <Pause className="w-4 h-4" /> توقف
              </button>
            ) : status === 'paused' ? (
              <button onClick={handleResume} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-xs flex items-center justify-center gap-2">
                <Play className="w-4 h-4" /> ادامه
              </button>
            ) : (
              <button onClick={() => startTranslation(0)} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> شروع ترجمه
              </button>
            )}

            <button onClick={handleDownload} disabled={status !== 'completed' && subtitles.filter(s => s.translatedText).length === 0} className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 font-bold rounded-xl text-xs flex items-center gap-2">
              <DownloadCloud className="w-4 h-4" /> دانلود فایل
            </button>
            <button onClick={() => setShowResetConfirm(true)} className="px-4 py-3 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 font-bold rounded-xl text-xs">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Preview List */}
        {subtitles.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {subtitles.map(item => (
              <div key={item.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1">
                <div className="flex justify-between text-slate-400 font-mono text-[10px]">
                  <span>#{item.id} [{item.startTime} --&gt; {item.endTime}]</span>
                  <span className={item.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}>{item.status}</span>
                </div>
                <p className="text-slate-300">{item.sourceText}</p>
                {item.translatedText && <p className="text-purple-300 font-bold border-t border-white/5 pt-1 mt-1">{item.translatedText}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
