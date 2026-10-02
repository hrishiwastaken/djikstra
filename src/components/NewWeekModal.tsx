import React, { useState } from 'react';
import { PreparationWeek, ExamFocus } from '../types';

interface NewWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWeek: (week: Partial<PreparationWeek>) => Promise<void>;
  existingCount: number;
}

export const NewWeekModal: React.FC<NewWeekModalProps> = ({
  isOpen,
  onClose,
  onSaveWeek,
  existingCount
}) => {
  if (!isOpen) return null;

  const nextNumber = existingCount + 38;
  const [id, setId] = useState(`2026-W${nextNumber}`);
  const [title, setTitle] = useState(`Cycle ${nextNumber} (Adaptive Cycle)`);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [allocationRatio, setAllocationRatio] = useState<'5:0' | '4:1' | '3:2' | '2:3' | '1:4' | '0:5'>('3:2');
  const [benchmarkExam, setBenchmarkExam] = useState<ExamFocus>('JEE');
  const [targetWeeklyHours, setTargetWeeklyHours] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const [jeeDays, cetDays] = allocationRatio.split(':').map(n => parseInt(n, 10));

    await onSaveWeek({
      id,
      title,
      startDate,
      endDate,
      jeeDays,
      cetDays,
      allocationRatio,
      benchmarkExam,
      targetWeeklyHours: parseInt(targetWeeklyHours, 10) || 30,
      status: 'active'
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white">Create New Preparation Cycle</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-400 block mb-1">Cycle ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
              required
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Allocation Ratio</label>
              <select
                value={allocationRatio}
                onChange={(e) => setAllocationRatio(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-cyan-300 font-bold"
              >
                <option value="5:0">5:0 (5 JEE / 0 CET)</option>
                <option value="4:1">4:1 (4 JEE / 1 CET)</option>
                <option value="3:2">3:2 (3 JEE / 2 CET)</option>
                <option value="2:3">2:3 (2 JEE / 3 CET)</option>
                <option value="1:4">1:4 (1 JEE / 4 CET)</option>
                <option value="0:5">0:5 (0 JEE / 5 CET)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Benchmark Exam</label>
              <select
                value={benchmarkExam}
                onChange={(e) => setBenchmarkExam(e.target.value as ExamFocus)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
              >
                <option value="JEE">JEE (300 Marks / 75 Qs)</option>
                <option value="CET">CET (200 Marks / 150 Qs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Target Study Hours</label>
            <input
              type="number"
              value={targetWeeklyHours}
              onChange={(e) => setTargetWeeklyHours(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
            >
              {isSubmitting ? 'Creating...' : 'Create Cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
