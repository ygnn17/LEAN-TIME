/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Sun, Moon, Feather, X, RotateCcw } from 'lucide-react';
import { DayNightRecord } from '../types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dateStr: string, dayHours: number, nightHours: number) => void;
  defaultDate: string;
  initialValue: number | DayNightRecord | null | undefined;
}

export default function RegisterModal({
  isOpen,
  onClose,
  onSubmit,
  defaultDate,
  initialValue,
}: RegisterModalProps) {
  const [dateStr, setDateStr] = useState(defaultDate);
  const [dayHours, setDayHours] = useState<string>('');
  const [nightHours, setNightHours] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setDateStr(defaultDate);
      if (initialValue) {
        if (typeof initialValue === 'number') {
          setDayHours(initialValue > 0 ? initialValue.toString() : '');
          setNightHours('');
        } else {
          setDayHours(initialValue.day > 0 ? initialValue.day.toString() : '');
          setNightHours(initialValue.night > 0 ? initialValue.night.toString() : '');
        }
      } else {
        setDayHours('');
        setNightHours('');
      }
    }
  }, [isOpen, defaultDate, initialValue]);

  const handleQuickAddDay = (amount: number) => {
    const current = parseFloat(dayHours) || 0;
    const next = Math.max(0, Math.min(24, parseFloat((current + amount).toFixed(1))));
    setDayHours(next === 0 ? '' : next.toString());
  };

  const handleQuickAddNight = (amount: number) => {
    const current = parseFloat(nightHours) || 0;
    const next = Math.max(0, Math.min(24, parseFloat((current + amount).toFixed(1))));
    setNightHours(next === 0 ? '' : next.toString());
  };

  const handleReset = () => {
    setDayHours('');
    setNightHours('');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const dayVal = parseFloat(dayHours) || 0;
    const nightVal = parseFloat(nightHours) || 0;

    if (dayVal < 0 || dayVal > 24 || nightVal < 0 || nightVal > 24) {
      alert('专注时长必须在 0 到 24 小时之间');
      return;
    }
    
    if (dayVal + nightVal > 24) {
      alert('单日总学时（白天 + 晚上）不能超过 24 小时');
      return;
    }

    onSubmit(dateStr, dayVal, nightVal);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', duration: 0.45 }}
            className="custom-card rounded-2xl p-6 max-w-md w-full border border-[var(--border-color)] shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Ambient gold-bead aura background decoration */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-[var(--accent-primary)]/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center mb-5 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[var(--accent-light)] text-[var(--accent-primary)]">
                  <Feather className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-[var(--text-main)] text-sm">分时专注登记</h3>
                  <p className="text-[10px] text-muted-flat mt-0.5">区分白天/夜间专注，帮助掌握脑力黄金时段</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer select-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-4 relative z-10">
              {/* Date selection */}
              <div>
                <label className="block text-[10px] text-[var(--text-muted)] font-extrabold mb-1.5 tracking-wide uppercase">
                  选择专注日期
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] text-[var(--text-main)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition font-bold"
                  />
                </div>
              </div>

              {/* Day / Night Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Daytime Study Panel */}
                <div className="p-3.5 rounded-xl border border-[var(--border-color)]/60 bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold mb-2">
                    <Sun className="w-4 h-4 animate-spin-slow" />
                    <span className="text-[11px]">白天专注时长</span>
                  </div>
                  <div className="relative mb-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="24"
                      value={dayHours}
                      onChange={(e) => setDayHours(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-[var(--border-color)] text-[var(--text-main)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] pr-8 transition font-mono font-semibold"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[var(--text-muted)]">时</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleQuickAddDay(num)}
                        className="flex-1 py-1 rounded bg-white dark:bg-slate-900 text-[10px] text-[var(--text-main)] font-semibold border border-[var(--border-color)]/60 hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer"
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Nighttime Study Panel */}
                <div className="p-3.5 rounded-xl border border-[var(--border-color)]/60 bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold mb-2">
                    <Moon className="w-3.5 h-3.5" />
                    <span className="text-[11px]">晚上专注时长</span>
                  </div>
                  <div className="relative mb-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="24"
                      value={nightHours}
                      onChange={(e) => setNightHours(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-[var(--border-color)] text-[var(--text-main)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] pr-8 transition font-mono font-semibold"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[var(--text-muted)]">时</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleQuickAddNight(num)}
                        className="flex-1 py-1 rounded bg-white dark:bg-slate-900 text-[10px] text-[var(--text-main)] font-semibold border border-[var(--border-color)]/60 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer"
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Combined Total Display and Clear Action */}
              <div className="flex items-center justify-between text-[11px] p-2 px-3 rounded-lg bg-slate-100/60 dark:bg-slate-900/40 border border-[var(--border-color)]/30">
                <span className="text-[var(--text-muted)]">
                  单日合计时间：<b className="font-mono text-sm text-[var(--text-main)] pl-0.5">
                    {((parseFloat(dayHours) || 0) + (parseFloat(nightHours) || 0)).toFixed(1)}
                  </b> 小时
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[var(--text-muted)] hover:text-red-500 font-bold transition select-none cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>重置</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-transparent border border-[var(--border-color)] text-[var(--text-main)] font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer select-none"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-bold text-xs tracking-wider shadow-md shadow-[var(--accent-glow)] transition-all active:scale-95 hover:brightness-105 cursor-pointer"
                >
                  确认登记
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
