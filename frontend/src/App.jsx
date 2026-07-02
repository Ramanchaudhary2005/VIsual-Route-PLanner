import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GraphProvider, useGraph } from './context/GraphContext';
import Sidebar from './components/Sidebar';
import GraphCanvas from './components/GraphCanvas';
import StatsPanel from './components/StatsPanel';
import ComparisonModal from './components/ComparisonModal';
import { Sun, Moon, Layers, BarChart3, Map, Activity } from 'lucide-react';

function MainApp() {
  const { theme, toggleTheme, graphType, nodes, isRunning, compareAlgorithms } = useGraph();
  const [engineStatus, setEngineStatus] = useState('connecting'); // 'online' | 'offline' | 'connecting'

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await axios.get('http://localhost:5000/health');
        setEngineStatus('online');
      } catch (err) {
        setEngineStatus('offline');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const getGraphTypeLabel = () => {
    switch (graphType) {
      case 'campus':
        return 'Campus Map Layout';
      case 'metro':
        return 'Metro Transit Network';
      default:
        return 'Custom Sandbox Graph';
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800/80 px-6 flex items-center justify-between bg-white/75 dark:bg-slate-900/60 backdrop-blur-md z-10 shrink-0 select-none">
        {/* Left: Brand & Engine status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Layers className="w-4 h-4" />
            </div>
            {engineStatus === 'online' && (
              <>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-slate-900 animate-ping"></div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-slate-900"></div>
              </>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight leading-none">
                Visual Route Planner
              </h1>
              <span className="px-1.5 py-0.5 rounded-full text-5xs font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10">
                v1.0
              </span>
              
              {/* Engine Status Pill */}
              {engineStatus === 'online' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-5xs font-black uppercase tracking-wider border border-emerald-500/15">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Engine Online
                </span>
              ) : engineStatus === 'offline' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-5xs font-black uppercase tracking-wider border border-rose-500/15">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span> Engine Offline
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-5xs font-black uppercase tracking-wider border border-amber-500/15">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span> Connecting...
                </span>
              )}
            </div>
            <p className="text-4xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Interactive Pathfinding Sandbox
            </p>
          </div>
        </div>

        {/* Center: Active layout pill */}
        <div className="hidden lg:flex items-center">
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 px-3.5 py-1 rounded-full text-3xs font-extrabold flex items-center gap-1.5 shadow-sm text-slate-600 dark:text-slate-350">
            <Map className="w-3.5 h-3.5 text-blue-500" />
            <span>Active: <span className="text-slate-800 dark:text-white">{getGraphTypeLabel()}</span></span>
          </div>
        </div>

        {/* Right: Quick comparisons, theme switch & code repo link */}
        <div className="flex items-center gap-3">
          {/* Quick Compare benchmark shortcut */}
          <button
            onClick={compareAlgorithms}
            disabled={isRunning || nodes.length < 2}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-2xs font-extrabold transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            title="Benchmark Algorithms"
          >
            <BarChart3 className="w-3.5 h-3.5" /> Compare live
          </button>

          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-all duration-200"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-2xs font-bold transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Control Panel Sidebar */}
        <Sidebar />

        {/* Central Workspace Canvas Area */}
        <main className="flex-1 flex flex-col relative bg-slate-50 dark:bg-slate-950 overflow-hidden h-full">
          {/* Floating Stats Dashboard */}
          <div className="absolute top-4 right-4 z-10 w-[calc(100%-2rem)] max-w-sm pointer-events-auto md:max-w-none md:w-auto md:left-4 md:right-auto lg:left-auto lg:right-4">
            <StatsPanel />
          </div>

          {/* Interactive Graph Canvas */}
          <div className="flex-1 w-full h-full">
            <GraphCanvas />
          </div>
        </main>
      </div>

      {/* Comparison Modal */}
      <ComparisonModal />
    </div>
  );
}

export default function App() {
  return (
    <GraphProvider>
      <MainApp />
    </GraphProvider>
  );
}
