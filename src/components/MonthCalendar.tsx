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
  const daysArray: { 
    dateStr: string; 
    dayNum: number; 
    hours: number; 
    leaveType?: 'normal' | 'special'; 
    leaveReason?: string; 
  }[] = [];

  for (let d = 1; d <= totalDays; d++) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const rVal = records[formattedDate];
    let hours = 0;
    let leaveType: 'normal' | 'special' | undefined = undefined;
    let leaveReason: string | undefined = undefined;

    if (typeof rVal === 'number') {
      hours = rVal;
    } else if (rVal) {
      hours = (rVal.day || 0) + (rVal.night || 0);
      leaveType = rVal.leaveType;
      leaveReason = rVal.leaveReason;
    }

    daysArray.push({
      dateStr: formattedDate,
      dayNum: d,
      hours: hours,
      leaveType,
      leaveReason,
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5 border-b border-[var(--border-color)] pb-4">
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
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted font-mono select-none">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-100 dark:bg-slate-800 border border-[var(--border-color)]" />
            <span>未登记</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40" />
            <span>有学时</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/15 border border-emerald-500/30" />
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">正常休息</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500/15 border border-rose-500/30" />
            <span className="text-rose-500 font-semibold">特殊事由</span>
          </div>
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
          const isToday = new Date().toISOString().split('T')[0] === day.dateStr;
          
          let intensityStyle = '';
          if (day.leaveType) {
            if (day.leaveType === 'normal') {
              intensityStyle = 'border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400 font-medium hover:border-emerald-500';
            } else {
              intensityStyle = 'border-rose-500/40 bg-rose-500/[0.08] text-rose-500 font-bold hover:border-rose-500';
            }
          } else {
            intensityStyle = getIntensityClass(day.hours);
          }

          return (
            <div
              key={day.dateStr}
              onClick={() => onDayClick(day.dateStr)}
              title={day.leaveReason ? `请假事由 (${day.leaveType === 'normal' ? '正常休息' : '特殊事由'}): ${day.leaveReason}` : undefined}
              className={`
                aspect-square p-2 rounded-xl flex flex-col justify-between border cursor-pointer select-none
                transition-all duration-300 transform active:scale-95 group relative
                ${intensityStyle}
                ${isToday ? 'ring-2 ring-[var(--accent-primary)] ring-offset-2 dark:ring-offset-slate-900 border-none' : ''}
              `}
            >
              {/* Day Number and Today Indicator */}
              <div className="flex justify-between items-start">
                <span className={`text-[11px] font-bold ${day.hours > 0 || day.leaveType ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                  {day.dayNum}
                </span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                )}
              </div>

              {/* Study scale indicator / Leave labels */}
              {day.leaveType ? (
                <div className="flex flex-col items-stretch text-left text-[9px] font-bold select-none leading-tight mt-1">
                  <span className={`truncate text-[9px] ${day.leaveType === 'normal' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {day.leaveType === 'normal' ? '息 自律' : '假 专事'}
                  </span>
                  {day.hours > 0 && (
                    <span className="font-mono text-[8px] font-extrabold opacity-80 text-right">
                      {day.hours.toFixed(1)}h
                    </span>
                  )}
                </div>
              ) : day.hours > 0 ? (
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
