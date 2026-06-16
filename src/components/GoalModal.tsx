/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, X } from 'lucide-react';
import { UserGoals } from '../types';

interface GoalModalProps {
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
  const [targetVal, setTargetVal] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTargetVal(
        activeView === 'week' 
          ? currentGoals.weeklyGoal.toString() 
          : currentGoals.monthlyGoal.toString()
      );
    }
  }, [isOpen, currentGoals, activeView]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetVal);
    if (isNaN(val) || val <= 0) {
      alert('目标时长必须是大于 0 的数值');
      return;
    }

    const updated = { ...currentGoals };
    if (activeView === 'week') {
      updated.weeklyGoal = val;
    } else {
      updated.monthlyGoal = val;
    }
    onSave(updated);
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
                  设定 {activeView === 'week' ? '本周' : '本月'} 学时目标
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-xs text-[var(--text-muted)] font-bold mb-2 tracking-wide uppercase">
                  新专注目标学时
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={targetVal}
                    onChange={(e) => setTargetVal(e.target.value)}
                    placeholder={activeView === 'week' ? '默认: 15h' : '默认: 60h'}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] text-[var(--text-main)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] pr-12 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-muted)] font-bold">
                    小时
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-transparent border border-[var(--border-color)] text-[var(--text-main)] font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-bold text-xs tracking-wider shadow-md shadow-[var(--accent-glow)] transition-all animate-pulse"
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
