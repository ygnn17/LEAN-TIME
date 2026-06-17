/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Sun, Moon, Clock, Flame } from 'lucide-react';
import { DayNightRecord } from '../types';

interface WeekChartProps {
  dayNightRecords: DayNightRecord[]; // 7 elements, Monday to Sunday
  dates: string[];                  // 7 YYYY-MM-DD strings
  onBarClick: (dateStr: string) => void;
}

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function WeekChart({ dayNightRecords, dates, onBarClick }: WeekChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate scaling limit
  const maxVal = Math.max(
    ...dayNightRecords.map(r => r.day),
    ...dayNightRecords.map(r => r.night),
    4
  );
  // Ensure chartMax is always an even integer so chartMax/2 is also a clean integer
  let chartMax = Math.ceil(maxVal);
  if (chartMax % 2 !== 0) {
    chartMax += 1;
  }

  const containerWidth = 500;
  const containerHeight = 320;
  const paddingTop = 45;
  const paddingBottom = 55;
  const paddingLeft = 42;
  const paddingRight = 15;

  const graphWidth = containerWidth - paddingLeft - paddingRight; // 443
  const graphHeight = containerHeight - paddingTop - paddingBottom; // 220
  
  // Y location of the zero center line
  const zeroY = paddingTop + (graphHeight / 2); // 155

  return (
    <div className="custom-card rounded-2xl p-6 relative select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[var(--accent-light)] text-[var(--accent-primary)]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-main text-base">本周分时专注能效</h3>
            <p className="text-[10px] text-muted tracking-wide mt-0.5">白天上行，夜间下行 | 点击立柱快速登记</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1 text-amber-500">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/80" />
            <span>白天 (h)</span>
          </div>
          <div className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400">
            <span className="w-2.5 h-2.5 rounded bg-indigo-500/80" />
            <span>夜间 (h)</span>
          </div>
        </div>
      </div>

      <div className="relative w-full" style={{ height: `${containerHeight}px` }}>
        {/* SVG Canvas with calibrated viewBox for responsive scaling */}
        <svg 
          viewBox={`0 0 ${containerWidth} ${containerHeight}`}
          width="100%"
          height="100%"
          className="w-full h-full overflow-visible"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="dayBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
              <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="nightBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={1} />
            </linearGradient>
            
            <linearGradient id="dayBarHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.9} />
            </linearGradient>
            <linearGradient id="nightBarHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#818cf8" stopOpacity={1} />
            </linearGradient>
          </defs>

          {/* Guidelines & Y-axis labels (Upward positive, center 0, downward positive as requested) */}
          {/* Top line: chartMax (白天) */}
          {/* Mid-top line: chartMax / 2 (白天) */}
          {/* Center line: 0 */}
          {/* Mid-bottom line: chartMax / 2 (夜间) */}
          {/* Bottom line: chartMax (夜间) */}
          {[
            { ratio: 1, label: `${chartMax}`, isDay: true },
            { ratio: 0.5, label: `${chartMax / 2}`, isDay: true },
            { ratio: 0, label: '0', isDay: false },
            { ratio: -0.5, label: `${chartMax / 2}`, isDay: false },
            { ratio: -1, label: `${chartMax}`, isDay: false }
          ].map((item, i) => {
            const y = zeroY - (item.ratio * (graphHeight / 2));
            const isCenter = item.ratio === 0;

            return (
              <g key={i} className={isCenter ? "opacity-90" : "opacity-35"}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={containerWidth - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  className={isCenter ? "text-[var(--accent-primary)]" : "text-[var(--border-color)]"}
                  strokeWidth={isCenter ? 1.5 : 1}
                  strokeDasharray={isCenter ? "" : "4 6"}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className={`font-mono text-[10px] font-bold ${
                    isCenter 
                      ? "fill-[var(--accent-primary)] font-extrabold" 
                      : item.isDay 
                        ? "fill-amber-600 dark:fill-amber-400" 
                        : "fill-indigo-600 dark:fill-indigo-400"
                  }`}
                >
                  {item.label}
                </text>
              </g>
            );
          })}

          {/* Render Bars for daytime and nighttime */}
          {dayNightRecords.map((rec, index) => {
            const colWidth = graphWidth / 7;
            const barWidthMultiplier = 0.44; // Bar thickness ratio
            const widthVal = colWidth * barWidthMultiplier;
            const xOffset = paddingLeft + (index * colWidth) + (colWidth * (1 - barWidthMultiplier) / 2);

            const isHovered = hoveredIndex === index;

            // Daytime bar (grows UP from zeroY)
            const dayHeightFraction = rec.day > 0 ? (rec.day / chartMax) : 0;
            const targetDayHeight = dayHeightFraction * (graphHeight / 2);
            const dayHeight = isMounted ? Math.max(dayHeightFraction > 0 ? 3 : 0, targetDayHeight) : 0;
            const dayY = zeroY - dayHeight;

            // Nighttime bar (grows DOWN from zeroY)
            const nightHeightFraction = rec.night > 0 ? (rec.night / chartMax) : 0;
            const targetNightHeight = nightHeightFraction * (graphHeight / 2);
            const nightHeight = isMounted ? Math.max(nightHeightFraction > 0 ? 3 : 0, targetNightHeight) : 0;
            const nightY = zeroY;

            // Formulate date label (e.g., "16日")
            const dateStr = dates[index];
            let dayLabel = '';
            if (dateStr) {
              const parts = dateStr.split('-');
              if (parts.length === 3) {
                dayLabel = `${parseInt(parts[2], 10)}日`;
              }
            }

            return (
              <g
                key={index}
                className="cursor-pointer"
                onClick={() => onBarClick(dates[index])}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Background Full Column Hover Receiver */}
                <rect
                  x={paddingLeft + (index * colWidth)}
                  y={0}
                  width={colWidth}
                  height={containerHeight}
                  fill="transparent"
                  pointerEvents="all"
                />

                {/* Daytime Bar (Going UP) */}
                {rec.day > 0 && (
                  <rect
                    x={xOffset}
                    y={dayY}
                    width={widthVal}
                    height={dayHeight}
                    rx={2}
                    fill={isHovered ? "url(#dayBarHover)" : "url(#dayBarGradient)"}
                    className="transition-all duration-300 pointer-events-none"
                    style={{
                      transition: 'y 0.5s cubic-bezier(0.16, 1, 0.3, 1), height 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                      filter: isHovered ? "drop-shadow(0px 0px 8px rgba(245, 158, 11, 0.4))" : "none"
                    }}
                  />
                )}

                {/* Nighttime Bar (Going DOWN) */}
                {rec.night > 0 && (
                  <rect
                    x={xOffset}
                    y={nightY}
                    width={widthVal}
                    height={nightHeight}
                    rx={2}
                    fill={isHovered ? "url(#nightBarHover)" : "url(#nightBarGradient)"}
                    className="transition-all duration-300 pointer-events-none"
                    style={{
                      transition: 'height 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                      filter: isHovered ? "drop-shadow(0px 0px 8px rgba(99, 102, 241, 0.4))" : "none"
                    }}
                  />
                )}

                {/* Leave Days Placeholder Pill with custom-color */}
                {rec.leaveType && rec.day === 0 && rec.night === 0 && (
                  <g className="pointer-events-none">
                    <rect
                      x={xOffset}
                      y={paddingTop + 10}
                      width={widthVal}
                      height={graphHeight - 20}
                      rx={3}
                      fill={rec.leaveType === 'normal' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)'}
                      stroke={rec.leaveType === 'normal' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={xOffset + widthVal / 2}
                      y={zeroY + 3.5}
                      textAnchor="middle"
                      className={`text-[9px] font-extrabold font-sans select-none tracking-tight ${
                        rec.leaveType === 'normal' ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-rose-500'
                      }`}
                    >
                      {rec.leaveType === 'normal' ? '休息' : '请假'}
                    </text>
                  </g>
                )}

                {/* Center intersection indicator dot if active */}
                {(rec.day > 0 || rec.night > 0) && (
                  <circle
                    cx={xOffset + widthVal / 2}
                    cy={zeroY}
                    r={2.8}
                    className={`pointer-events-none stroke-1 ${
                      rec.leaveType 
                        ? rec.leaveType === 'normal'
                          ? "fill-emerald-500 stroke-emerald-600"
                          : "fill-rose-500 stroke-rose-600"
                        : "fill-white stroke-[var(--accent-primary)]"
                    }`}
                  />
                )}

                {/* Weekday Label */}
                <text
                  x={paddingLeft + (index * colWidth) + (colWidth / 2)}
                  y={containerHeight - 27}
                  textAnchor="middle"
                  className={`
                    text-xs font-bold select-none transition-colors duration-200 pointer-events-none
                    ${isHovered ? 'fill-[var(--accent-primary)] font-bold' : 'fill-[var(--text-main)]'}
                  `}
                >
                  {WEEKDAYS[index]}
                </text>

                {/* Date sub-header Label */}
                <text
                  x={paddingLeft + (index * colWidth) + (colWidth / 2)}
                  y={containerHeight - 11}
                  textAnchor="middle"
                  className={`
                    font-mono text-[9px] select-none transition-colors duration-200 font-semibold pointer-events-none
                    ${isHovered ? 'fill-[var(--accent-primary)]' : 'fill-[var(--text-muted)]'}
                  `}
                >
                  {dayLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Float Tooltip Portal (Glass Styled) */}
        <AnimatePresence>
          {hoveredIndex !== null && (() => {
            const colWidth = graphWidth / 7;
            const xPercent = ((paddingLeft + (hoveredIndex * colWidth) + (colWidth / 2)) / containerWidth) * 100;
            const rec = dayNightRecords[hoveredIndex];
            const total = rec.day + rec.night;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute glass-panel p-3.5 rounded-xl border border-[var(--border-color)] shadow-xl pointer-events-none z-30 flex flex-col gap-1.5 text-xs -translate-x-1/2"
                style={{
                  left: `${xPercent}%`,
                  top: `40px`, // Position at fixed top height for dual bars
                }}
              >
                <div className="flex items-center gap-1.5 font-bold text-[var(--text-main)] font-display whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span>{WEEKDAYS[hoveredIndex]} 专注明细</span>
                </div>
                
                <div className="space-y-1 border-t border-[var(--border-color)]/50 pt-1.5">
                  <div className="flex items-center justify-between gap-5 text-[11px]">
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Sun className="w-3 h-3" /> 白天：
                    </span>
                    <span className="font-mono font-bold text-[var(--text-main)]">{rec.day.toFixed(1)}h</span>
                  </div>
                  <div className="flex items-center justify-between gap-5 text-[11px]">
                    <span className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 font-semibold">
                      <Moon className="w-3 h-3" /> 夜间：
                    </span>
                    <span className="font-mono font-bold text-[var(--text-main)]">{rec.night.toFixed(1)}h</span>
                  </div>
                  <div className="flex items-center justify-between gap-5 text-[11px] font-bold text-[var(--text-main)] border-t border-dashed border-[var(--border-color)]/60 pt-1">
                    <span>合计学时：</span>
                    <span className="font-mono">{total.toFixed(1)}h</span>
                  </div>
                </div>

                {total >= 4 && (
                  <div className="mt-0.5 self-start inline-flex items-center px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 text-[9px] font-bold gap-0.5 leading-none">
                    <Flame className="w-2.5 h-2.5 fill-current" /> 高效自律
                  </div>
                )}

                {rec.leaveType && (
                  <div className={`mt-2 p-1.5 px-2 rounded-lg text-[10px] border leading-relaxed ${
                    rec.leaveType === 'normal'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5 mb-0.5 whitespace-nowrap">
                      <span className={`w-1.5 h-1.5 rounded-full ${rec.leaveType === 'normal' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{rec.leaveType === 'normal' ? '正常休息' : '特殊事由请假'}</span>
                    </div>
                    {rec.leaveReason && (
                      <p className="text-[9px] text-zinc-500 dark:text-zinc-400 italic break-all max-w-[150px]">
                        “{rec.leaveReason}”
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
}
