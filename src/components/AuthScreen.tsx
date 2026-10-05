import React, { useState } from 'react';
import { GitFork, Lock, User, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { AuthUser, AuthSession } from '../types';

interface AuthScreenProps {
  onAuthenticated: (session: AuthSession) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 4) {
        setErrorMessage('Password must be at least 4 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        // Backend might be warming up (Render cold start) or returning HTML fallback
        throw new Error(
          res.status === 404
            ? 'Backend API unreachable. If using Render free tier, server may be waking up.'
            : 'Server is currently waking up (Cold Start). Please wait 20 seconds and click again.'
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      const session: AuthSession = {
        token: data.token,
        user: data.user
      };

      if (rememberMe) {
        try {
          localStorage.setItem('dijkstra_auth_session', JSON.stringify(session));
        } catch (e) {
          console.warn('Could not store session in localStorage:', e);
        }
      }

      onAuthenticated(session);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-indigo-600/10 blur-[130px] pointer-events-none rounded-full" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/25 ring-1 ring-cyan-400/40 mb-3">
            <GitFork className="h-7 w-7 text-white" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-extrabold text-2xl tracking-tight text-white font-mono">DIJKSTRA</h1>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              JEE / CET v1.1
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Deterministic Telemetry · Diagnostic Reasoning · Adaptive Prep
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800/80 mb-6 font-mono text-xs">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`py-2 px-3 rounded-lg font-bold transition-all ${
                mode === 'login'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              className={`py-2 px-3 rounded-lg font-bold transition-all ${
                mode === 'register'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Mode Sub-banner */}
          {mode === 'register' ? (
            <div className="mb-5 p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-[11px] font-mono text-cyan-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Zero-State Initialization</strong>
                On account creation, your syllabus matrix, logs, and hours start strictly at zero. You will configure your own personal AI keys.
              </div>
            </div>
          ) : (
            <div className="mb-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                Private access to your multi-device study telemetry, Curricular Weakness Matrix, and diagnostic error vault.
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-slate-300 font-semibold block">Account Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. arjun_jee2026"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between items-center">
                <label className="text-slate-300 font-semibold">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Confirm Password (if registering) */}
            {mode === 'register' && (
              <div className="space-y-1.5 font-mono text-xs">
                <label className="text-slate-300 font-semibold block">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Remember Me / Persistent Session */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-slate-400 hover:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/20"
                />
                <span>Save login on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs tracking-wider uppercase shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>Connecting to Workspace...</span>
              ) : mode === 'register' ? (
                <>
                  <span>Create Clean Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Access Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security / Isolation note */}
        <p className="text-center text-[11px] font-mono text-slate-500 mt-6">
          🔒 Each account maintains its own isolated API keys, study telemetry, and Curricular Weakness Matrix.
        </p>
      </div>
    </div>
  );
};
