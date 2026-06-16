/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { StudyRecord } from '../types';

interface MonthCalendarProps {
  navDate: Date;
  records: StudyRecord;
  onDayClick: (dateStr: string) => void;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export default function MonthCalendar({ navDate, records, onDayClick }: MonthCalendarProps) {
  const year = navDate.getFullYear();
  const month = navDate.getMonth(); // 0-indexed

  // 1. Calculate paddings
  const firstDayObj = new Date(year, month, 1);
  const firstDayIndex = firstDayObj.getDay(); // 0 is Sunday, 1 is Monday...
  // Adjust so Monday is 0, Sunday is 6
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // 2. Total days
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Elements mapping
  const daysArray: { dateStr: string; dayNum: number; hours: number }[] = [];

  for (let d = 1; d <= totalDays; d++) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hours = records[formattedDate] || 0;
    daysArray.push({
      dateStr: formattedDate,
      dayNum: d,
      hours: hours,
    });
  }

  // Handle color scaling of intensity
  const getIntensityClass = (hours: number) => {
    if (hours === 0) return 'hover:border-slate-300 dark:hover:border-slate-600 bg-[var(--bg-card)] border-[var(--border-color)]';
    if (hours < 2) return 'border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/[0.05] text-[var(--text-main)] shadow-[inset_0_0_8px_rgba(16,185,129,0.03)]';
    if (hours < 5) return 'border-[var(--accent-primary)]/60 bg-[var(--accent-primary)]/[0.12] text-[var(--accent-primary)] shadow-[inset_0_0_10px_rgba(16,185,129,0.055)] font-medium';
    return 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/[0.22] text-[var(--accent-primary)] shadow-[0_4px_12px_rgba(16,185,129,0.08)] font-bold';
  };

  return (
    <div className="custom-card rounded-2xl p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-5 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[var(--accent-light)] text-[var(--accent-primary)]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-main text-base">月度成长格网</h3>
            <p className="text-[10px] text-muted tracking-wide mt-0.5">点击具体日期直接写入或覆写学时</p>
          </div>
        </div>

        {/* Legend block */}
        <div className="flex items-center gap-3 text-[10px] text-muted font-mono select-none">
          <span>无记录</span>
          <span className="w-2.5 h-2.5 rounded bg-slate-100 dark:bg-slate-800 border border-[var(--border-color)]" />
          <span className="w-2.5 h-2.5 rounded bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20" />
          <span className="w-2.5 h-2.5 rounded bg-[var(--accent-primary)]/25 border border-[var(--accent-primary)]/50" />
          <span className="w-2.5 h-2.5 rounded bg-[var(--accent-primary)]/40 border border-[var(--accent-primary)]" />
          <span>深度专注</span>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-[var(--text-muted)] font-bold mb-3 select-none">
        {WEEKDAYS.map((w, index) => (
          <div key={index} className="py-1">{w}</div>
        ))}
      </div>

      {/* Dynamic Grid Box */}
      <div className="grid grid-cols-7 gap-2.5">
        {/* Fill spacers */}
        {Array.from({ length: adjustedFirstDay }).map((_, idx) => (
          <div 
            key={`spacer-${idx}`} 
            className="aspect-square rounded-xl bg-transparent border border-transparent pointer-events-none" 
          />
        ))}

        {/* Core Date Grids */}
        {daysArray.map((day) => {
          const intensityStyle = getIntensityClass(day.hours);
          const isToday = new Date().toISOString().split('T')[0] === day.dateStr;

          return (
            <div
              key={day.dateStr}
              onClick={() => onDayClick(day.dateStr)}
              className={`
                aspect-square p-2 rounded-xl flex flex-col justify-between border cursor-pointer select-none
                transition-all duration-300 transform active:scale-95 group relative
                ${intensityStyle}
                ${isToday ? 'ring-2 ring-[var(--accent-primary)] ring-offset-2 dark:ring-offset-slate-900 border-none' : ''}
              `}
            >
              {/* Day Number and Today Indicator */}
              <div className="flex justify-between items-start">
                <span className={`text-[11px] font-bold ${day.hours > 0 ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                  {day.dayNum}
                </span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                )}
              </div>

              {/* Study scale indicator */}
              {day.hours > 0 ? (
                <div className="flex items-center justify-between text-[10px] font-mono select-none mt-1">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                  </span>
                  <span className="truncate max-w-full text-right font-extrabold pr-0.5">
                    {day.hours.toFixed(1)}h
                  </span>
                </div>
              ) : (
                <div className="h-4" />
              )}
              
              {/* Interactive subtle hover border glow */}
              <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-300" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
