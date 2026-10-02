import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Target, 
  Clock, 
  Award, 
  Sliders, 
  Plus, 
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { PreparationWeek, BenchmarkTest, ExamFocus, SubjectBenchmarkBreakdown } from '../types';

interface BenchmarkViewProps {
  currentWeek: PreparationWeek;
  weeks: PreparationWeek[];
  onSaveBenchmark: (benchmark: BenchmarkTest) => Promise<void>;
  onUpdateAllocation: (weekId: string, ratio: string, jeeDays: number, cetDays: number) => Promise<void>;
}

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({
  currentWeek,
  weeks,
  onSaveBenchmark,
  onUpdateAllocation
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [examType, setExamType] = useState<ExamFocus>(currentWeek.benchmarkExam || 'JEE');
  const [notes, setNotes] = useState('');

  // Physics breakdown
  const [pAttempted, setPAttempted] = useState('');
  const [pCorrect, setPCorrect] = useState('');
  const [pWrong, setPWrong] = useState('');

  // Chemistry breakdown
  const [cAttempted, setCAttempted] = useState('');
  const [cCorrect, setCCorrect] = useState('');
  const [cWrong, setCWrong] = useState('');

  // Math breakdown
  const [mAttempted, setMAttempted] = useState('');
  const [mCorrect, setMCorrect] = useState('');
  const [mWrong, setMWrong] = useState('');

  // Allocation ratios
  const allowedRatios: Array<{ ratio: '5:0' | '4:1' | '3:2' | '2:3' | '1:4' | '0:5'; jee: number; cet: number; desc: string }> = [
    { ratio: '5:0', jee: 5, cet: 0, desc: 'Pure JEE Focus (Advance preparation)' },
    { ratio: '4:1', jee: 4, cet: 1, desc: 'JEE Dominant with CET calibration' },
    { ratio: '3:2', jee: 3, cet: 2, desc: 'Standard Balanced Preparation' },
    { ratio: '2:3', jee: 2, cet: 3, desc: 'CET Dominant (Throughput sprint)' },
    { ratio: '1:4', jee: 1, cet: 4, desc: 'High Velocity Speed Focus' },
    { ratio: '0:5', jee: 0, cet: 5, desc: 'Pure CET Throughput Practice' }
  ];

  const handleRatioSelect = async (item: typeof allowedRatios[0]) => {
    await onUpdateAllocation(currentWeek.id, item.ratio, item.jee, item.cet);
  };

  const handleSaveBenchmarkTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const isJee = examType === 'JEE';
    const totalQ = isJee ? 75 : 150;
    const maxScore = isJee ? 300 : 200;

    // JEE marks: +4 for correct, -1 for wrong. CET marks: +1 for correct (Physics/Chem) and +2 for Math in CET, 0 for wrong
    const pAtt = parseInt(pAttempted, 10) || 0;
    const pCor = parseInt(pCorrect, 10) || 0;
    const pWrn = parseInt(pWrong, 10) || 0;
    const pScore = isJee ? (pCor * 4 - pWrn) : pCor;

    const cAtt = parseInt(cAttempted, 10) || 0;
    const cCor = parseInt(cCorrect, 10) || 0;
    const cWrn = parseInt(cWrong, 10) || 0;
    const cScore = isJee ? (cCor * 4 - cWrn) : cCor;

    const mAtt = parseInt(mAttempted, 10) || 0;
    const mCor = parseInt(mCorrect, 10) || 0;
    const mWrn = parseInt(mWrong, 10) || 0;
    const mScore = isJee ? (mCor * 4 - mWrn) : (mCor * 2);

    const totalScore = pScore + cScore + mScore;
    const totalAttempted = pAtt + cAtt + mAtt;
    const totalCorrect = pCor + cCor + mCor;
    const totalWrong = pWrn + cWrn + mWrn;

    const breakdown: SubjectBenchmarkBreakdown[] = [
      {
        subject: 'Physics',
        attempted: pAtt,
        correct: pCor,
        wrong: pWrn,
        skipped: (isJee ? 25 : 50) - pAtt,
        score: pScore,
        maxScore: isJee ? 100 : 50,
        accuracy: pAtt > 0 ? Math.round((pCor / pAtt) * 100) : 0
      },
      {
        subject: 'Chemistry',
        attempted: cAtt,
        correct: cCor,
        wrong: cWrn,
        skipped: (isJee ? 25 : 50) - cAtt,
        score: cScore,
        maxScore: isJee ? 100 : 50,
        accuracy: cAtt > 0 ? Math.round((cCor / cAtt) * 100) : 0
      },
      {
        subject: 'Mathematics',
        attempted: mAtt,
        correct: mCor,
        wrong: mWrn,
        skipped: (isJee ? 25 : 50) - mAtt,
        score: mScore,
        maxScore: isJee ? 100 : 100,
        accuracy: mAtt > 0 ? Math.round((mCor / mAtt) * 100) : 0
      }
    ];

    const newBenchmark: BenchmarkTest = {
      id: `bm_${currentWeek.id}_${Date.now()}`,
      weekId: currentWeek.id,
      date: new Date().toISOString().split('T')[0],
      examType,
      totalQuestions: totalQ,
      attempted: totalAttempted,
      correct: totalCorrect,
      wrong: totalWrong,
      skipped: totalQ - totalAttempted,
      score: totalScore,
      maximumScore: maxScore,
      durationMinutes: 180,
      subjectBreakdown: breakdown,
      notes
    };

    await onSaveBenchmark(newBenchmark);
    setIsRecording(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
              Longitudinal Sensor · Section 7 Spec
            </span>
            <span className="text-xs font-mono text-slate-400">
              Cycle: {currentWeek.id}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Conclusive Benchmark Test & Allocation Control
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1 max-w-xl">
            Every preparation cycle ends with a conclusive benchmark alternating between JEE and CET as an objective sensor signal.
          </p>
        </div>

        <button
          onClick={() => setIsRecording(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          {currentWeek.benchmark ? 'Update Benchmark Test' : 'Record Benchmark Test'}
        </button>
      </div>

      {/* JEE:CET Allocation Manager (Section 5 Spec: 5:0, 4:1, 3:2, 2:3, 1:4, 0:5) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Cycle Preparation Allocation (Section 5 Spec)
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Controllable allocation ratio for the week. Adjust as exam dates and diagnostic data change.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-cyan-300 font-bold">
            Current: {currentWeek.allocationRatio}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {allowedRatios.map((item) => {
            const isSelected = currentWeek.allocationRatio === item.ratio;
            return (
              <button
                key={item.ratio}
                onClick={() => handleRatioSelect(item)}
                className={`p-3 rounded-xl border text-left font-mono transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 ring-1 ring-cyan-400/30 shadow-md shadow-cyan-950/40' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div>
                  <div className="text-base font-bold text-white mb-0.5">
                    {item.ratio}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {item.jee} JEE : {item.cet} CET
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 mt-2 line-clamp-2">
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Benchmark History across Cycles */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Conclusive Benchmark History & Signal Longitudinal Progression
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weeks.map(w => {
            const bm = w.benchmark;
            const pct = bm ? Math.round((bm.score / bm.maximumScore) * 100) : 0;

            return (
              <div 
                key={w.id}
                className={`p-4 rounded-xl border font-mono text-xs space-y-3 ${
                  w.id === currentWeek.id ? 'bg-slate-950 border-cyan-700/60' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{w.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    w.benchmarkExam === 'JEE' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}>
                    {w.benchmarkExam} Benchmark
                  </span>
                </div>

                {bm ? (
                  <>
                    <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                      <div>
                        <span className="text-2xl font-extrabold text-white">{bm.score}</span>
                        <span className="text-slate-500"> / {bm.maximumScore}</span>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm">{pct}%</span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                      {bm.subjectBreakdown.map(sb => (
                        <div key={sb.subject} className="flex justify-between text-slate-400">
                          <span>{sb.subject}:</span>
                          <span className="text-slate-200 font-semibold">{sb.score}/{sb.maxScore}</span>
                        </div>
                      ))}
                    </div>

                    {bm.notes && (
                      <p className="text-[10px] text-slate-400 italic bg-slate-900/60 p-2 rounded">
                        "{bm.notes}"
                      </p>
                    )}
                  </>
                ) : (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    Pending cycle completion test
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Record Benchmark Modal */}
      {isRecording && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-mono">
                  Record Conclusive Benchmark Test
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  {currentWeek.id} · Standardized 3-Hour Examination
                </p>
              </div>
              <button 
                onClick={() => setIsRecording(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBenchmarkTest} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Exam Type</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as ExamFocus)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="JEE">JEE (75 Questions / 300 Maximum Marks)</option>
                  <option value="CET">CET (150 Questions / 200 Maximum Marks)</option>
                </select>
              </div>

              {/* Physics */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-2">Physics Subject Results</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-500 block mb-1">Attempted</label>
                    <input
                      type="number"
                      value={pAttempted}
                      onChange={(e) => setPAttempted(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-center text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-emerald-500 block mb-1">Correct</label>
                    <input
                      type="number"
                      value={pCorrect}
                      onChange={(e) => setPCorrect(e.target.value)}
                      className="w-full bg-slate-900 border border-emerald-800 rounded p-1.5 text-center text-emerald-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-rose-500 block mb-1">Wrong</label>
                    <input
                      type="number"
                      value={pWrong}
                      onChange={(e) => setPWrong(e.target.value)}
                      className="w-full bg-slate-900 border border-rose-800 rounded p-1.5 text-center text-rose-300 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Chemistry */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-2">Chemistry Subject Results</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-500 block mb-1">Attempted</label>
                    <input
                      type="number"
                      value={cAttempted}
                      onChange={(e) => setCAttempted(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-center text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-emerald-500 block mb-1">Correct</label>
                    <input
                      type="number"
                      value={cCorrect}
                      onChange={(e) => setCCorrect(e.target.value)}
                      className="w-full bg-slate-900 border border-emerald-800 rounded p-1.5 text-center text-emerald-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-rose-500 block mb-1">Wrong</label>
                    <input
                      type="number"
                      value={cWrong}
                      onChange={(e) => setCWrong(e.target.value)}
                      className="w-full bg-slate-900 border border-rose-800 rounded p-1.5 text-center text-rose-300 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Mathematics */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-purple-400 font-bold block mb-2">Mathematics Subject Results</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-500 block mb-1">Attempted</label>
                    <input
                      type="number"
                      value={mAttempted}
                      onChange={(e) => setMAttempted(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-center text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-emerald-500 block mb-1">Correct</label>
                    <input
                      type="number"
                      value={mCorrect}
                      onChange={(e) => setMCorrect(e.target.value)}
                      className="w-full bg-slate-900 border border-emerald-800 rounded p-1.5 text-center text-emerald-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-rose-500 block mb-1">Wrong</label>
                    <input
                      type="number"
                      value={mWrong}
                      onChange={(e) => setMWrong(e.target.value)}
                      className="w-full bg-slate-900 border border-rose-800 rounded p-1.5 text-center text-rose-300 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Test Observations / Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Physics and Chemistry were smooth; Math time was compressed."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecording(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Commit Benchmark Results
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
