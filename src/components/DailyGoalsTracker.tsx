import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Target, 
  Flame, 
  Sparkles, 
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { DailyTask } from '../types';

interface DailyGoalsTrackerProps {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  compact?: boolean;
  onTasksChange?: (tasks: DailyTask[]) => void;
  onOpenDailyLog?: () => void;
  userId?: string;
}

export const DailyGoalsTracker: React.FC<DailyGoalsTrackerProps> = ({
  selectedDate: propDate,
  onDateChange,
  compact = false,
  onTasksChange,
  onOpenDailyLog,
  userId
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [activeDate, setActiveDate] = useState<string>(propDate || todayStr);
  const storageKey = userId ? `dijkstra_daily_goals_${userId}` : 'dijkstra_daily_goals';

  // All goals grouped by date (per account)
  const [goalsByDate, setGoalsByDate] = useState<Record<string, DailyTask[]>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse daily goals from localStorage:', e);
    }
    // New user starts completely clean (zero goals on database on creation)
    if (userId) {
      return {};
    }
    // Demo starter tasks for unauthenticated view
    return {
      [todayStr]: [
        {
          id: 'task_1',
          title: 'Solve 25 JEE Advanced Mechanics PyQs',
          subject: 'Physics',
          targetMinutes: 60,
          completed: true,
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          id: 'task_2',
          title: 'Review Coordination Chemistry NCERT Key Concepts',
          subject: 'Chemistry',
          targetMinutes: 45,
          completed: false,
          priority: 'medium',
          createdAt: new Date().toISOString()
        },
        {
          id: 'task_3',
          title: 'Timed 30-min CET Speed Sprint (Differential Calculus)',
          subject: 'Mathematics',
          targetMinutes: 30,
          completed: false,
          priority: 'high',
          createdAt: new Date().toISOString()
        }
      ]
    };
  });

  // Reload when userId changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setGoalsByDate(JSON.parse(saved));
      } else if (userId) {
        setGoalsByDate({});
      }
    } catch (e) {
      console.warn('Failed to reload goals for user:', e);
    }
  }, [storageKey, userId]);

  // Active day's tasks
  const tasks = goalsByDate[activeDate] || [];

  // Form state for adding tasks
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Mock' | 'General'>('Physics');
  const [newMinutes, setNewMinutes] = useState('45');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(goalsByDate));
    } catch (e) {
      console.warn('Failed to save daily goals:', e);
    }
    if (onTasksChange) {
      onTasksChange(goalsByDate[activeDate] || []);
    }
  }, [goalsByDate, activeDate, storageKey]);

  useEffect(() => {
    if (propDate && propDate !== activeDate) {
      setActiveDate(propDate);
    }
  }, [propDate]);

  const handleToggleTask = (taskId: string) => {
    setGoalsByDate(prev => {
      const currentList = prev[activeDate] || [];
      const updated = currentList.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return { ...prev, [activeDate]: updated };
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: DailyTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: newTitle.trim(),
      subject: newSubject,
      targetMinutes: parseInt(newMinutes, 10) || 30,
      completed: false,
      priority: newPriority,
      createdAt: new Date().toISOString()
    };

    setGoalsByDate(prev => ({
      ...prev,
      [activeDate]: [...(prev[activeDate] || []), newTask]
    }));

    setNewTitle('');
  };

  const handleDeleteTask = (taskId: string) => {
    setGoalsByDate(prev => ({
      ...prev,
      [activeDate]: (prev[activeDate] || []).filter(t => t.id !== taskId)
    }));
  };

  // Metrics computation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const totalMinutesPlanned = tasks.reduce((sum, t) => sum + (t.targetMinutes || 0), 0);
  const totalMinutesCompleted = tasks.filter(t => t.completed).reduce((sum, t) => sum + (t.targetMinutes || 0), 0);
  const plannedHours = (totalMinutesPlanned / 60).toFixed(1);
  const completedHours = (totalMinutesCompleted / 60).toFixed(1);

  // Subject colors
  const getSubjectBadge = (sub?: string) => {
    switch (sub) {
      case 'Physics':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
      case 'Chemistry':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
      case 'Mathematics':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      case 'Mock':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getPriorityBadge = (p?: string) => {
    switch (p) {
      case 'high':
        return 'text-rose-400 bg-rose-950/40 border-rose-900/60';
      case 'medium':
        return 'text-amber-400 bg-amber-950/40 border-amber-900/60';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  // Compact View for Dashboard Widget
  if (compact) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                Daily Study Goals & Velocity
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {activeDate === todayStr ? "Today's Agenda" : activeDate} · {completedTasks}/{totalTasks} done
              </p>
            </div>
          </div>
          {onOpenDailyLog && (
            <button
              onClick={onOpenDailyLog}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>Manage Goals</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Progress Bar & Stats */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-300 font-medium">
              Execution Rate: <strong className="text-cyan-300">{completionRate}%</strong>
            </span>
            <span className="text-slate-400">
              {completedHours}h completed / {plannedHours}h planned
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Quick Task List (up to 4) */}
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-xs font-mono text-slate-500 text-center py-3">
              No tasks set for today. Click Manage Goals to plan your session.
            </p>
          ) : (
            tasks.slice(0, 4).map(task => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  task.completed 
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60' 
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600 hover:text-cyan-400 shrink-0" />
                  )}
                  <span className={`text-xs font-mono truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getSubjectBadge(task.subject)}`}>
                    {task.subject}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {task.targetMinutes}m
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Full Planning View for DailyLogView
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      
      {/* Header with Date Selector & Progress Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono tracking-tight uppercase">
              Daily Study Goals & Micro-Task Planner
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Plan your daily focus, track task throughput, and maintain high cognitive execution before logging.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveDate(todayStr);
              if (onDateChange) onDateChange(todayStr);
            }}
            className={`px-2.5 py-1.5 rounded-lg border transition-all ${
              activeDate === todayStr 
                ? 'bg-cyan-950 text-cyan-300 border-cyan-800/60 font-semibold' 
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Today
          </button>
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={activeDate}
              onChange={(e) => {
                setActiveDate(e.target.value);
                if (onDateChange) onDateChange(e.target.value);
              }}
              className="bg-transparent text-slate-200 text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Visual Progress Dashboard Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 font-mono text-xs">
        <div className="space-y-1">
          <span className="text-slate-400 text-[11px] block">Task Completion</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-cyan-300">{completionRate}%</span>
            <span className="text-slate-400 text-[11px]">({completedTasks}/{totalTasks} tasks)</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 text-[11px] block">Planned Target Time</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">{completedHours}h</span>
            <span className="text-slate-400 text-[11px]">of {plannedHours}h targeted</span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            {totalMinutesCompleted}m elapsed across tasks
          </span>
        </div>

        <div className="flex items-center justify-start sm:justify-end">
          {totalTasks > 0 && completionRate === 100 ? (
            <div className="px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>All Goals Achieved! 🎉</span>
            </div>
          ) : totalTasks > 0 ? (
            <div className="px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 flex items-center gap-2 text-xs">
              <Flame className="w-4 h-4 text-cyan-400" />
              <span>{totalTasks - completedTasks} task(s) remaining</span>
            </div>
          ) : (
            <div className="text-slate-500 text-xs">
              Add goals below to start tracking
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Goal Form */}
      <form onSubmit={handleAddTask} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3">
        <span className="text-xs font-mono font-semibold text-slate-300 block">
          + Add New Goal / Micro-Task for {activeDate}
        </span>
        
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Title */}
          <div className="sm:col-span-6">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Solve 30 Thermodynamics Questions..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Subject */}
          <div className="sm:col-span-2">
            <select
              value={newSubject}
              onChange={(e: any) => setNewSubject(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Mock">Mock Exam</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Target Minutes */}
          <div className="sm:col-span-2">
            <div className="relative">
              <input
                type="number"
                min="5"
                max="300"
                step="5"
                value={newMinutes}
                onChange={(e) => setNewMinutes(e.target.value)}
                placeholder="Minutes"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 pr-7"
              />
              <span className="absolute right-2.5 top-2 text-[10px] text-slate-500 font-mono pointer-events-none">
                min
              </span>
            </div>
          </div>

          {/* Priority */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>
          </div>
        </div>
      </form>

      {/* Task Filters */}
      <div className="flex items-center justify-between gap-2 font-mono text-xs pt-1">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
          {(['all', 'pending', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded capitalize transition-all ${
                filter === f 
                  ? 'bg-slate-800 text-cyan-300 font-semibold' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-slate-500">
          {filteredTasks.length} task(s) listed
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-6 bg-slate-950/30 border border-dashed border-slate-800 rounded-xl font-mono text-xs text-slate-500">
            {tasks.length === 0 
              ? 'No goals set for this date. Use the form above to plan your study day!'
              : `No ${filter} tasks found.`}
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                task.completed 
                  ? 'bg-slate-950/30 border-slate-800/50 opacity-70' 
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div 
                onClick={() => handleToggleTask(task.id)}
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600 hover:text-cyan-400 shrink-0 transition-colors" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-mono font-medium truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${getSubjectBadge(task.subject)}`}>
                      {task.subject}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {task.targetMinutes} mins
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  title="Remove goal"
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
