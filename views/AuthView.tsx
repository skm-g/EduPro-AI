
import React, { useState } from 'react';
import Button from '../components/Button';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';

interface AuthViewProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<'form' | 'google-popup'>('form');

  // Simulated Google Auth Flow
  const handleGoogleLogin = () => {
    setIsAuthenticating(true);
    setAuthStep('google-popup');

    // Simulate the OAuth redirect/popup delay
    setTimeout(() => {
      // For demo purposes, we log in as the student mock user (Alex Chen)
      const googleUser = MOCK_USERS.find(u => u.id === '3') || MOCK_USERS[2];
      onLogin(googleUser);
      setIsAuthenticating(false);
    }, 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    // Default to student login for email/password demo
    setTimeout(() => {
      onLogin(MOCK_USERS[2]);
      setIsAuthenticating(false);
    }, 1500);
  };

  if (authStep === 'google-popup') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-md p-10 shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-6 transition-all duration-300">
          <div className="w-20 h-20 mx-auto relative">
             <div className="absolute inset-0 bg-indigo-600 rounded-full animate-ping opacity-20"></div>
             <div className="relative w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700">
               <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-10 h-10" alt="Google" />
             </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Connecting to Google</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Verifying your account details...</p>
          </div>
          <div className="pt-4 flex justify-center">
            <div className="flex gap-1.5">
               <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
               <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-indigo-100 selection:text-indigo-900">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all"
      >
        <i className="fa-solid fa-arrow-left"></i> Back to Home
      </button>

      <div className="w-full max-w-[440px] space-y-8 transition-all duration-500 opacity-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-200 dark:shadow-none">
            <i className="fa-solid fa-graduation-cap text-3xl"></i>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {isLogin ? 'Continue your learning journey with EduPro AI' : 'Start your transformation today'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 shadow-xl border border-slate-100 dark:border-slate-800 space-y-8">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                  <input 
                    required
                    type="text" 
                    placeholder="Enter your name"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input 
                  required
                  type="email" 
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                {isLogin && <button type="button" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">Forgot?</button>}
              </div>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              size="lg" 
              className="w-full rounded-2xl shadow-indigo-100" 
              isLoading={isAuthenticating}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
            </div>
            <span className="relative px-4 bg-white dark:bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Or continue with</span>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isAuthenticating}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Google Account</span>
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          By continuing, you agree to our <a href="#" className="font-bold text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="font-bold text-indigo-600 hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default AuthView;