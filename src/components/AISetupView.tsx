import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Sparkles, 
  Cpu, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Camera, 
  RefreshCw,
  Server,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { AISetupConfig } from '../types';

interface AISetupViewProps {
  onSettingsSaved: () => void;
}

export const AISetupView: React.FC<AISetupViewProps> = ({ onSettingsSaved }) => {
  // OCR Model State
  const [ocrProvider, setOcrProvider] = useState<'gemini' | 'openai_compatible'>('gemini');
  const [ocrApiKey, setOcrApiKey] = useState('');
  const [ocrModel, setOcrModel] = useState('gemini-3.8-flash');
  const [ocrBaseUrl, setOcrBaseUrl] = useState('https://openrouter.ai/api/v1');
  const [showOcrKey, setShowOcrKey] = useState(false);
  const [ocrConfigured, setOcrConfigured] = useState(false);
  const [ocrMaskedKey, setOcrMaskedKey] = useState('');

  // Thinking Model State
  const [thinkingProvider, setThinkingProvider] = useState<'gemini' | 'openai_compatible'>('gemini');
  const [thinkingApiKey, setThinkingApiKey] = useState('');
  const [thinkingModel, setThinkingModel] = useState('gemini-3.8-flash');
  const [thinkingBaseUrl, setThinkingBaseUrl] = useState('https://openrouter.ai/api/v1');
  const [showThinkingKey, setShowThinkingKey] = useState(false);
  const [thinkingConfigured, setThinkingConfigured] = useState(false);
  const [thinkingMaskedKey, setThinkingMaskedKey] = useState('');

  // Status and Testing
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingOcr, setIsTestingOcr] = useState(false);
  const [isTestingThinking, setIsTestingThinking] = useState(false);
  
  const [ocrTestResult, setOcrTestResult] = useState<{ success: boolean; latencyMs?: number; message?: string } | null>(null);
  const [thinkingTestResult, setThinkingTestResult] = useState<{ success: boolean; latencyMs?: number; message?: string } | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Load existing configuration on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.ocrProvider) setOcrProvider(data.ocrProvider);
        if (data.ocrModel) setOcrModel(data.ocrModel);
        if (data.ocrBaseUrl) setOcrBaseUrl(data.ocrBaseUrl);
        setOcrConfigured(Boolean(data.ocrConfigured));
        setOcrMaskedKey(data.ocrMaskedKey || '');

        if (data.thinkingProvider) setThinkingProvider(data.thinkingProvider);
        if (data.thinkingModel) setThinkingModel(data.thinkingModel);
        if (data.thinkingBaseUrl) setThinkingBaseUrl(data.thinkingBaseUrl);
        setThinkingConfigured(Boolean(data.thinkingConfigured));
        setThinkingMaskedKey(data.thinkingMaskedKey || '');
      })
      .catch(e => console.warn('Could not load AI settings:', e));
  }, []);

  const handleTestOcr = async () => {
    setIsTestingOcr(true);
    setOcrTestResult(null);
    try {
      const res = await fetch('/api/settings/test-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ocrProvider,
          ocrApiKey: ocrApiKey || undefined,
          ocrModel,
          ocrBaseUrl
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOcrTestResult({
          success: true,
          latencyMs: data.latencyMs,
          message: `Success (${data.latencyMs}ms): Connected to ${data.model}`
        });
      } else {
        setOcrTestResult({
          success: false,
          message: data.error || 'Connection verification failed'
        });
      }
    } catch (err: any) {
      setOcrTestResult({ success: false, message: err.message || 'Network error' });
    } finally {
      setIsTestingOcr(false);
    }
  };

  const handleTestThinking = async () => {
    setIsTestingThinking(true);
    setThinkingTestResult(null);
    try {
      const res = await fetch('/api/settings/test-thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thinkingProvider,
          thinkingApiKey: thinkingApiKey || undefined,
          thinkingModel,
          thinkingBaseUrl
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setThinkingTestResult({
          success: true,
          latencyMs: data.latencyMs,
          message: `Success (${data.latencyMs}ms): Connected to ${data.model}`
        });
      } else {
        setThinkingTestResult({
          success: false,
          message: data.error || 'Connection verification failed'
        });
      }
    } catch (err: any) {
      setThinkingTestResult({ success: false, message: err.message || 'Network error' });
    } finally {
      setIsTestingThinking(false);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ocrProvider,
          ocrApiKey: ocrApiKey || undefined,
          ocrModel,
          ocrBaseUrl,
          thinkingProvider,
          thinkingApiKey: thinkingApiKey || undefined,
          thinkingModel,
          thinkingBaseUrl
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSaveSuccessMessage('AI API Keys and Provider configurations saved securely.');
        if (ocrApiKey) {
          setOcrConfigured(true);
          setOcrMaskedKey('••••••••' + ocrApiKey.slice(-4));
          setOcrApiKey('');
        }
        if (thinkingApiKey) {
          setThinkingConfigured(true);
          setThinkingMaskedKey('••••••••' + thinkingApiKey.slice(-4));
          setThinkingApiKey('');
        }
        onSettingsSaved();
        setTimeout(() => setSaveSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
            Model Strategy · Section 36 Spec
          </span>
          <span className="text-xs font-mono text-slate-400">
            Decoupled Vision & Analytical Reasoning Providers
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          AI Model Provider & API Key Setup
        </h1>
        <p className="text-xs font-mono text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Dijkstra keeps AI providers completely replaceable. Submit external API keys below: one for standardized physical notebook OCR extraction, and one for deep longitudinal diagnostic reasoning.
        </p>

        {/* Global Key Status Badges */}
        <div className="mt-4 flex flex-wrap gap-3 font-mono text-xs">
          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
            ocrConfigured ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
          }`}>
            <Camera className="w-3.5 h-3.5" />
            <span>OCR Model: <strong>{ocrConfigured ? 'Configured & Active' : 'Key Required'}</strong></span>
          </div>

          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
            thinkingConfigured ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
          }`}>
            <Cpu className="w-3.5 h-3.5" />
            <span>Thinking Model: <strong>{thinkingConfigured ? 'Configured & Active' : 'Key Required'}</strong></span>
          </div>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {saveSuccessMessage}
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        
        {/* Model 1: OCR / Vision Model (Stage A) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  1. OCR / Vision Model (Daily Notebook Digitization)
                </h2>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Extracts structured error records, cognitive classifications, and reasons from student notebook photos
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 self-start sm:self-auto">
              Section 37 Spec
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            {/* Provider Type */}
            <div>
              <label className="text-slate-400 block mb-1">OCR Provider</label>
              <select
                value={ocrProvider}
                onChange={(e) => {
                  const p = e.target.value as any;
                  setOcrProvider(p);
                  if (p === 'gemini') setOcrModel('gemini-3.8-flash');
                  else setOcrModel('qwen/qwen-2.5-vl-72b-instruct');
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="gemini">Google Gemini Multimodal API</option>
                <option value="openai_compatible">OpenAI-Compatible / OpenRouter (Qwen3-VL, GLM-OCR, OpenAI)</option>
              </select>
            </div>

            {/* Model Name */}
            <div>
              <label className="text-slate-400 block mb-1">Vision Model Name</label>
              <input
                type="text"
                value={ocrModel}
                onChange={(e) => setOcrModel(e.target.value)}
                placeholder={ocrProvider === 'gemini' ? 'gemini-3.8-flash' : 'qwen/qwen-2.5-vl-72b-instruct'}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                {ocrProvider === 'gemini' ? 'Recommended: gemini-3.8-flash' : 'Candidates: qwen/qwen-2.5-vl-72b-instruct, glm-ocr, gpt-4o'}
              </span>
            </div>
          </div>

          {/* Base URL (if openai compatible) */}
          {ocrProvider === 'openai_compatible' && (
            <div className="font-mono text-xs">
              <label className="text-slate-400 block mb-1">API Base URL</label>
              <input
                type="text"
                value={ocrBaseUrl}
                onChange={(e) => setOcrBaseUrl(e.target.value)}
                placeholder="https://openrouter.ai/api/v1"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Enter your custom endpoint or leave as OpenRouter URL
              </span>
            </div>
          )}

          {/* API Key Input */}
          <div className="font-mono text-xs">
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400">
                OCR API Key {ocrMaskedKey && <span className="text-emerald-400 font-semibold">(Current: {ocrMaskedKey})</span>}
              </label>
              <button
                type="button"
                onClick={() => setShowOcrKey(!showOcrKey)}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                {showOcrKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showOcrKey ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <input
              type={showOcrKey ? 'text' : 'password'}
              value={ocrApiKey}
              onChange={(e) => setOcrApiKey(e.target.value)}
              placeholder={ocrConfigured ? 'Enter new key to update, or leave blank to keep current' : 'Paste your API key here (e.g. AIza... or sk-or-...)'}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Test OCR Button & Result */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <button
              type="button"
              onClick={handleTestOcr}
              disabled={isTestingOcr || (!ocrApiKey && !ocrConfigured)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold flex items-center gap-2 border border-slate-700 disabled:opacity-40 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingOcr ? 'animate-spin' : ''}`} />
              {isTestingOcr ? 'Testing OCR Ping...' : 'Test OCR Connection'}
            </button>

            {ocrTestResult && (
              <span className={`text-[11px] ${ocrTestResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {ocrTestResult.message}
              </span>
            )}
          </div>
        </div>

        {/* Model 2: Thinking / Reasoning Model (Stage B) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  2. Thinking / Reasoning Model (Weekly Longitudinal Diagnosis)
                </h2>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Evaluates structured metrics, diagnoses bottlenecks, forms hypotheses, and outputs Next Week Experiments
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 self-start sm:self-auto">
              Section 38 Spec
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            {/* Provider Type */}
            <div>
              <label className="text-slate-400 block mb-1">Thinking Provider</label>
              <select
                value={thinkingProvider}
                onChange={(e) => {
                  const p = e.target.value as any;
                  setThinkingProvider(p);
                  if (p === 'gemini') setThinkingModel('gemini-3.8-flash');
                  else setThinkingModel('deepseek/deepseek-r1');
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="gemini">Google Gemini API (Flash / Pro Reasoning)</option>
                <option value="openai_compatible">OpenAI-Compatible / OpenRouter (DeepSeek-R1, Qwen Thinking, Claude)</option>
              </select>
            </div>

            {/* Model Name */}
            <div>
              <label className="text-slate-400 block mb-1">Reasoning Model Name</label>
              <input
                type="text"
                value={thinkingModel}
                onChange={(e) => setThinkingModel(e.target.value)}
                placeholder={thinkingProvider === 'gemini' ? 'gemini-3.8-flash' : 'deepseek/deepseek-r1'}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                {thinkingProvider === 'gemini' ? 'Recommended: gemini-3.8-flash' : 'Candidates: deepseek/deepseek-r1, qwen/qwen-2.5-72b-instruct, gpt-4o'}
              </span>
            </div>
          </div>

          {/* Base URL (if openai compatible) */}
          {thinkingProvider === 'openai_compatible' && (
            <div className="font-mono text-xs">
              <label className="text-slate-400 block mb-1">API Base URL</label>
              <input
                type="text"
                value={thinkingBaseUrl}
                onChange={(e) => setThinkingBaseUrl(e.target.value)}
                placeholder="https://openrouter.ai/api/v1"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Enter your custom endpoint or leave as OpenRouter URL
              </span>
            </div>
          )}

          {/* API Key Input */}
          <div className="font-mono text-xs">
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400">
                Thinking API Key {thinkingMaskedKey && <span className="text-emerald-400 font-semibold">(Current: {thinkingMaskedKey})</span>}
              </label>
              <button
                type="button"
                onClick={() => setShowThinkingKey(!showThinkingKey)}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                {showThinkingKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showThinkingKey ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <input
              type={showThinkingKey ? 'text' : 'password'}
              value={thinkingApiKey}
              onChange={(e) => setThinkingApiKey(e.target.value)}
              placeholder={thinkingConfigured ? 'Enter new key to update, or leave blank to keep current' : 'Paste your API key here (e.g. AIza... or sk-or-...)'}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Test Thinking Button & Result */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <button
              type="button"
              onClick={handleTestThinking}
              disabled={isTestingThinking || (!thinkingApiKey && !thinkingConfigured)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold flex items-center gap-2 border border-slate-700 disabled:opacity-40 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingThinking ? 'animate-spin' : ''}`} />
              {isTestingThinking ? 'Testing Reasoning Ping...' : 'Test Thinking Connection'}
            </button>

            {thinkingTestResult && (
              <span className={`text-[11px] ${thinkingTestResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {thinkingTestResult.message}
              </span>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs font-mono text-slate-400">
            Keys are transmitted securely and stored in server memory only.
          </span>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving Configurations...' : 'Save AI Model Configurations'}
          </button>
        </div>

      </form>

    </div>
  );
};
