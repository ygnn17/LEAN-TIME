/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, ShieldAlert, Zap, Compass, CheckCircle, RefreshCcw, Activity } from 'lucide-react';
import { AICoachAnalysis } from '../types';

interface AICoachPanelProps {
  analysis: AICoachAnalysis | null;
  loading: boolean;
  onTriggerAnalyze: () => void;
  isFallback: boolean;
  analysisMode?: 'local' | 'ai';
  onSwitchMode?: (mode: 'local' | 'ai') => void;
}

const LOADING_STATUSES = [
  '正在统计本期时序分布...',
  '正在对比目标达成指数...',
  '评价近期持续打卡稳定性...',
  '量身设计简单的快乐自律指南...',
  '正在书写暖心的诊断小卡片...'
];

export default function AICoachPanel({
  analysis,
  loading,
  onTriggerAnalyze,
  isFallback,
  analysisMode = 'local',
  onSwitchMode,
}: AICoachPanelProps) {
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Rotate loading text occasionally so user remains highly engaged
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingTextIndex(0);
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % LOADING_STATUSES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="custom-card rounded-2xl p-6 relative overflow-hidden">
      {/* Dynamic ambient vector glows */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--accent-primary)]/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[var(--accent-secondary)]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[var(--accent-light)] text-[var(--accent-primary)]">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-main text-base flex items-center gap-1.5">
              <span>专属专注诊断教练</span>
              {isFallback && analysisMode === 'ai' && (
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                  已温和降级至本地算法
                </span>
              )}
            </h3>
            <p className="text-[10px] text-muted tracking-wide mt-0.5">提供温暖、正面鼓励的学习调频方案</p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={onTriggerAnalyze}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-[var(--accent-light)] text-[var(--accent-primary)] hover:brightness-95 disabled:opacity-50 transition cursor-pointer select-none font-semibold font-display"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>刷新诊断</span>
        </button>
      </div>

      {/* 模式选择与工作原理说明 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 mb-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[var(--border-color)]/60 text-xs">
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="font-extrabold text-[var(--text-main)] shrink-0">分析方案:</span>
          <div className="flex bg-slate-200/50 dark:bg-slate-800/60 p-0.5 rounded-lg border border-[var(--border-color)]/30">
            <button
              onClick={() => onSwitchMode && onSwitchMode('local')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all duration-200 select-none ${
                analysisMode === 'local'
                  ? 'bg-[var(--bg-card)] text-[var(--accent-primary)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              内置基础分析
            </button>
            <button
              onClick={() => onSwitchMode && onSwitchMode('ai')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all duration-200 select-none ${
                analysisMode === 'ai'
                  ? 'bg-[var(--bg-card)] text-[var(--accent-primary)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              云端 AI 深度分析
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="text-[11px] text-[var(--accent-primary)] hover:brightness-95 transition-all duration-150 font-bold flex items-center gap-1 select-none shrink-0 self-end sm:self-auto"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{showHowItWorks ? '收起原理说明' : '教练工作原理？'}</span>
        </button>
      </div>

      {/* 工作原理卡片 */}
      <AnimatePresence>
        {showHowItWorks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-5"
          >
            <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-slate-900/40 border border-dashed border-amber-200 dark:border-slate-800 text-xs text-[var(--text-muted)] leading-relaxed space-y-2">
              <p className="font-extrabold text-[var(--text-main)] flex items-center gap-1.5 text-[12px] text-amber-800 dark:text-amber-300">
                <Brain className="w-4 h-4" /> 专注诊断教练是如何工作的？
              </p>
              <p>为了给您提供最合适、无压力的心理自律反馈，系统设计了两个灵活的运行方案：</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-orange-50/40 dark:bg-slate-800/20 border border-[var(--border-color)]/10">
                  <p className="font-bold text-amber-950 dark:text-amber-200 text-[11px] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-orange-500" />
                    1. 内置基础数据分析 (本地零配置)
                  </p>
                  <p className="mt-1 text-[11px]">
                    完全运行在本地。统计您本周或本月的<strong>累计总时间</strong>、<strong>打卡活跃天数</strong>以及<strong>单日最高时长</strong>，利用内置分析算法快速提炼优点并输出，保障离线或无 AI 预配置时的基本分析逻辑。
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50/40 dark:bg-slate-800/20 border border-[var(--border-color)]/10">
                  <p className="font-bold text-blue-900 dark:text-blue-200 text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    2. 云端 AI 深度分析 (Gemini 热能驱动)
                  </p>
                  <p className="mt-1 text-[11px]">
                    需要云端配置 <code>GEMINI_API_KEY</code> 秘匙。AI 扮演温和热诚、极富爱心的贴地学习树洞，用大白话将数据解构成最鼓舞人心的日常干货方案，杜绝枯燥复杂的术语。
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-amber-700/80 dark:text-amber-400 mt-1">
                💡 <b>温馨提示</b>：若选择云端 AI 分析但未配置大模型密钥，系统将自动降级并以本地算法代替，保证正常展示无错乱！
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {loading ? (
          /* High Premium Loading Screen */
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="py-12 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]"
          >
            <div className="relative">
              {/* Spinning decorative geometric elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--accent-primary)]/30 border-t-[var(--accent-primary)]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[var(--accent-primary)] animate-bounce" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-sm">
              <h4 className="text-sm font-bold text-[var(--text-main)] font-display tracking-wide animate-pulse">
                时间美学大脑正在解构数据...
              </h4>
              <p className="text-xs text-[var(--text-muted)] font-medium h-4 flex items-center justify-center">
                <motion.span
                  key={loadingTextIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {LOADING_STATUSES[loadingTextIndex]}
                </motion.span>
              </p>
            </div>
          </motion.div>
        ) : analysis ? (
          /* Renders Structured analysis */
          <motion.div
            key="analysis-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45 }}
            className="space-y-5 relative z-10"
          >
            {/* Section 1: Time Pattern diagnostics */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[var(--border-color)] relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-primary)]" />
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-light)] text-[var(--accent-primary)]">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[var(--text-main)] font-display tracking-wide uppercase">
                    {analysis.patternTitle}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                    {analysis.patternContent}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Energy Peaks */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[var(--border-color)] relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-secondary)]" />
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-light)] text-[var(--accent-secondary)]">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[var(--text-main)] font-display tracking-wide uppercase">
                    {analysis.strengthTitle}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                    {analysis.strengthContent}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Clinical actionable guide checklists */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[var(--border-color)] relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--text-muted)] opacity-60" />
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-light)] text-[var(--text-muted)]">
                  <Compass className="w-4 h-4 text-[var(--text-main)]" />
                </div>
                <div className="space-y-3 w-full">
                  <h4 className="text-xs font-bold text-[var(--text-main)] font-display tracking-wide uppercase">
                    {analysis.actionTitle}
                  </h4>
                  <ul className="space-y-2.5">
                    {analysis.actionPoints.map((pointStr, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2.5 text-xs text-[var(--text-muted)] leading-relaxed"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                        <span className="font-medium">{pointStr}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Centered Zen Maxim quotes footer */}
            <div className="pt-2 text-center text-xs text-[var(--text-muted)] italic font-medium px-4 select-none relative">
              <span className="text-base text-[var(--accent-primary)] font-serif absolute -top-1 left-2 pr-1 select-none">“</span>
              <p className="relative z-10 font-sans tracking-wide">
                {analysis.metricsContext}
              </p>
              <span className="text-base text-[var(--accent-primary)] font-serif absolute -bottom-3 right-2 pl-1 select-none">”</span>
            </div>
          </motion.div>
        ) : (
          /* Empty Initial State - calls to action */
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <Activity className="w-12 h-12 text-[var(--accent-primary)]/20 stroke-1" />
            <div className="max-w-xs space-y-1">
              <h4 className="text-xs font-bold text-[var(--text-main)] font-display">等待启动诊断书...</h4>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                点击上方<strong className="text-[var(--accent-primary)] font-bold">重新诊断</strong>或者录入新学时，激活基于真实脑科学的时间对齐模型。
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
