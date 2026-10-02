import React from 'react';
import { 
  GitFork, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Sliders, 
  HelpCircle,
  Plus,
  Key
} from 'lucide-react';
import { PreparationWeek } from '../types';

interface HeaderProps {
  weeks: PreparationWeek[];
  selectedWeekId: string;
  onSelectWeek: (id: string) => void;
  feedbackLoopEnabled: boolean;
  onToggleFeedbackLoop: (enabled: boolean) => void;
  onOpenNewWeekModal: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  weeks,
  selectedWeekId,
  onSelectWeek,
  feedbackLoopEnabled,
  onToggleFeedbackLoop,
  onOpenNewWeekModal,
  activeTab,
  onSelectTab
}) => {
  const currentWeek = weeks.find(w => w.id === selectedWeekId) || weeks[0];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top utility brand row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <GitFork className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-mono">DIJKSTRA</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                JEE / CET v1.1
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Measure · Diagnose · Adapt
            </p>
          </div>
        </div>

        {/* Center: Preparation Cycle Switcher & Allocation */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <label className="text-xs font-mono text-slate-400 px-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Cycle:
          </label>
          <select 
            value={selectedWeekId} 
            onChange={(e) => onSelectWeek(e.target.value)}
            className="bg-slate-900 text-xs font-mono font-medium text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            {weeks.map(w => (
              <option key={w.id} value={w.id}>
                {w.id} : {w.title} ({w.allocationRatio}) {w.status === 'active' ? '• Active' : ''}
              </option>
            ))}
          </select>

          {currentWeek && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 rounded-lg border border-slate-700/80 text-xs font-mono">
              <span className="text-slate-400">Ratio:</span>
              <span className="text-cyan-300 font-semibold">{currentWeek.allocationRatio}</span>
              <span className="text-[11px] text-slate-400">({currentWeek.jeeDays} JEE / {currentWeek.cetDays} CET)</span>
            </div>
          )}

          <button
            onClick={onOpenNewWeekModal}
            title="Create New Cycle"
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Feedback Loop Switch (Specified in README Section 4) */}
        <div className="flex items-center gap-3">
          <div 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              feedbackLoopEnabled 
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm shadow-emerald-900/30' 
                : 'bg-amber-950/30 border-amber-600/40'
            }`}
          >
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold flex items-center gap-1 justify-end">
                <span className={`w-2 h-2 rounded-full ${feedbackLoopEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                Feedback Loop
              </span>
              <span className="text-[10px] text-slate-400">
                {feedbackLoopEnabled ? 'Full Adaptive Pipeline' : 'Fast Capture Only'}
              </span>
            </div>

            <button
              onClick={() => onToggleFeedbackLoop(!feedbackLoopEnabled)}
              type="button"
              role="switch"
              aria-checked={feedbackLoopEnabled}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                feedbackLoopEnabled ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  feedbackLoopEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

      </div>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 border-t border-slate-800/80 scrollbar-none py-1">
        {[
          { id: 'dashboard', label: 'Executive Dashboard', icon: Sliders },
          { id: 'daily-log', label: 'Daily Capture & OCR', icon: Clock },
          { id: 'weekly-report', label: 'Weekly AI Report', icon: Zap },
          { id: 'benchmark', label: 'Benchmark & Allocation', icon: CheckCircle2 },
          { id: 'curriculum', label: 'Curriculum & Error Vault', icon: GitFork },
          { id: 'ai-setup', label: 'AI Setup & Keys', icon: Key }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                isActive 
                  ? 'bg-slate-800 text-cyan-300 border-b-2 border-cyan-400 font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
