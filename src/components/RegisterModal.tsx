/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Feather, X } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dateStr: string, hours: number) => void;
  defaultDate: string;
  initialHours: number | null;
}

export default function RegisterModal({
  isOpen,
  onClose,
  onSubmit,
  defaultDate,
  initialHours,
}: RegisterModalProps) {
  const [dateStr, setDateStr] = useState(defaultDate);
  const [hoursVal, setHoursVal] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setDateStr(defaultDate);
      setHoursVal(initialHours && initialHours > 0 ? initialHours.toString() : '');
    }
  }, [isOpen, defaultDate, initialHours]);

  const handleQuickAdd = (amount: number) => {
    if (amount === 0) {
      setHoursVal('');
    } else {
      const current = parseFloat(hoursVal) || 0;
      const next = Math.max(0, Math.min(24, parseFloat((current + amount).toFixed(1))));
      setHoursVal(next.toString());
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(hoursVal);
    if (dateStr && !isNaN(val)) {
      if (val < 0 || val > 24) {
        alert('专注时长必须在 0 到 24 小时之间');
        return;
      }
      onSubmit(dateStr, val);
    } else {
      // If empty space submitted, interpret as deletion (0h)
      onSubmit(dateStr, 0);
    }
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
            className="custom-card rounded-2xl p-6 max-w-sm w-full border border-[var(--border-color)] shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Ambient gold-bead aura background decoration */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-[var(--accent-primary)]/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[var(--accent-light)] text-[var(--accent-primary)]">
                  <Feather className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-[var(--text-main)] text-base">登记学时</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-5 relative z-10">
              <div>
                <label className="block text-xs text-[var(--text-muted)] font-bold mb-2 tracking-wide uppercase">
                  选择专注日期
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] text-[var(--text-main)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] font-bold mb-2 tracking-wide uppercase">
                  专注时长 (小时)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    value={hoursVal}
                    onChange={(e) => setHoursVal(e.target.value)}
                    placeholder="今天累计投入了多少个钟头？"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] text-[var(--text-main)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] pr-12 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-muted)] font-bold">
                    小时
                  </span>
                </div>
              </div>

              {/* Fast presets selection */}
              <div className="space-y-1.5">
                <span className="block text-[10px] text-[var(--text-muted)] font-bold tracking-wide uppercase">
                  快捷增加
                </span>
                <div className="flex gap-2">
                  {[1, 2, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleQuickAdd(num)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[var(--accent-light)] hover:text-[var(--accent-primary)] text-xs text-[var(--text-main)] font-semibold border border-[var(--border-color)] transition-colors"
                    >
                      +{num}h
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(0)}
                    className="flex-1 py-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 text-xs text-rose-500 font-semibold border border-rose-500/10 transition-colors"
                  >
                    重置
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-transparent border border-[var(--border-color)] text-[var(--text-main)] font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-bold text-xs tracking-wider shadow-md shadow-[var(--accent-glow)] transition-transform active:scale-95 hover:brightness-105"
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
