import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type AuthPageProps = {
  mode: 'login' | 'signup' | 'forgot';
  setCurrentPage: (page: string) => void;
};

export default function AuthPage({ mode: initialMode, setCurrentPage }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message.includes('Invalid login') ? 'Invalid email or password.' : error.message);
        } else {
          setCurrentPage('dashboard');
        }
      } else if (mode === 'signup') {
        if (!fullName.trim()) { setError('Please enter your full name.'); setLoading(false); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); setLoading(false); return; }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message.includes('already registered') ? 'This email is already registered.' : error.message);
        } else {
          setCurrentPage('dashboard');
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) setError(error.message);
        else setSuccess('Password reset email sent! Check your inbox.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-mesh pt-16">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 relative overflow-hidden items-center justify-center p-16">
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white/5"
              style={{ width: `${100 + i * 60}px`, height: `${100 + i * 60}px`, top: `${10 + i * 12}%`, left: `${10 + i * 8}%`, animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </div>
        <div className="relative text-center text-white space-y-8">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-sm">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-bold mb-3">Inner Vaani</h2>
            <p className="text-xl text-teal-100 font-light">Find your inner voice,</p>
            <p className="text-xl text-teal-100 font-light">heal your inner self.</p>
          </div>
          <div className="space-y-4 text-left max-w-sm">
            {[
              'AI-powered emotional analysis',
              'Personalized wellness recommendations',
              'Safe, anonymous community support',
              'Track your mental wellness journey',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-teal-200 flex-shrink-0" />
                <span className="text-teal-100 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </button>

          <div>
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Inner Vaani</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Start your journey' : 'Reset password'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {mode === 'login' ? "Don't have an account? " : mode === 'signup' ? 'Already have an account? ' : 'Remember your password? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
                className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Ananya Krishnan" required
                  className="input-field"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="input-field"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                  {mode === 'signup' && <span className="text-gray-400 font-normal ml-1">(min 8 characters)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required minLength={mode === 'signup' ? 8 : undefined}
                    className="input-field pr-12"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button type="button" onClick={() => setMode('forgot')} className="text-sm text-teal-600 dark:text-teal-400 hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>

            {mode !== 'forgot' && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                By {mode === 'signup' ? 'creating an account' : 'signing in'}, you agree to our{' '}
                <span className="text-teal-600 dark:text-teal-400 cursor-pointer hover:underline">Terms</span> and{' '}
                <span className="text-teal-600 dark:text-teal-400 cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
