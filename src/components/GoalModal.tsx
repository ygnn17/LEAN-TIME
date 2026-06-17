/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, X } from 'lucide-react';
import { UserGoals } from '../types';

export interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoals: UserGoals;
  activeView: 'week' | 'month';
  onSave: (updated: UserGoals) => void;
}

export default function GoalModal({
  isOpen,
  onClose,
  currentGoals,
  activeView,
  onSave,
}: GoalModalProps) {
  const [weeklyVal, setWeeklyVal] = useState<string>('');
  const [monthlyVal, setMonthlyVal] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setWeeklyVal(currentGoals.weeklyGoal.toString());
      setMonthlyVal(currentGoals.monthlyGoal.toString());
    }
  }, [isOpen, currentGoals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wNum = parseFloat(weeklyVal);
    const mNum = parseFloat(monthlyVal);

    if (isNaN(wNum) || wNum <= 0) {
      alert('周目标时长必须是大于 0 的数值');
      return;
    }
    if (isNaN(mNum) || mNum <= 0) {
      alert('月目标时长必须是大于 0 的数值');
      return;
    }

    onSave({
      weeklyGoal: wNum,
      monthlyGoal: mNum,
    });
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

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="custom-card rounded-2xl p-6 max-w-sm w-full border border-[var(--border-color)] shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Ambient Aura */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-[var(--accent-primary)]/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center mb-5 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[var(--accent-light)] text-[var(--accent-primary)]">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-[var(--text-main)] text-sm">
                  设定学时目标计划
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4.5 relative z-10">
              {/* Weekly target input */}
              <div className={`p-3 rounded-xl border transition ${activeView === 'week' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/[0.02]' : 'border-[var(--border-color)]/60 bg-slate-50/50 dark:bg-slate-950/40'}`}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] text-[var(--text-muted)] font-extrabold uppercase tracking-wide">
                    周计划专注时间
                  </label>
                  {activeView === 'week' && (
                    <span className="text-[9px] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-1.5 py-0.5 rounded-md font-bold">
                      当前视图
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="168"
                    step="1"
                    value={weeklyVal}
                    onChange={(e) => setWeeklyVal(e.target.value)}
                    placeholder="默认: 15h"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-[var(--border-color)] text-[var(--text-main)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] pr-12 transition font-bold font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--text-muted)] font-bold">
                    小时 / 周
                  </span>
                </div>
              </div>

              {/* Monthly target input */}
              <div className={`p-3 rounded-xl border transition ${activeView === 'month' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/[0.02]' : 'border-[var(--border-color)]/60 bg-slate-50/50 dark:bg-slate-950/40'}`}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] text-[var(--text-muted)] font-extrabold uppercase tracking-wide">
                    月计划专注时间
                  </label>
                  {activeView === 'month' && (
                    <span className="text-[9px] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-1.5 py-0.5 rounded-md font-bold">
                      当前视图
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="744"
                    step="1"
                    value={monthlyVal}
                    onChange={(e) => setMonthlyVal(e.target.value)}
                    placeholder="默认: 60h"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-[var(--border-color)] text-[var(--text-main)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] pr-12 transition font-bold font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--text-muted)] font-bold">
                    小时 / 月
                  </span>
                </div>
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
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-bold text-xs tracking-wider shadow-md shadow-[var(--accent-glow)] transition-all cursor-pointer hover:brightness-105 active:scale-95"
                >
                  保存并应用
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
