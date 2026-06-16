/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Clock, Flame } from 'lucide-react';

interface WeekChartProps {
  hoursData: number[]; // 7 elements, Monday to Sunday
  dates: string[];     // 7 YYYY-MM-DD strings
  onBarClick: (dateStr: string) => void;
}

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function WeekChart({ hoursData, dates, onBarClick }: WeekChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate scaling
  const maxHours = Math.max(...hoursData, 6); // default standard scale to at least 6h
  const chartMax = Math.ceil(maxHours + 1.5);

  const containerHeight = 280;
  const paddingBottom = 40;
  const paddingTop = 30;
  const paddingLeft = 35;
  const paddingRight = 15;

  const graphHeight = containerHeight - paddingTop - paddingBottom;

  return (
    <div className="custom-card rounded-2xl p-6 relative select-none">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[var(--accent-light)] text-[var(--accent-primary)]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-main text-base">本周能效分布</h3>
            <p className="text-[10px] text-muted tracking-wide mt-0.5">点击立柱快速修改该日学时</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="w-2 h-2 rounded-full bg-gradient-to-t from-[var(--accent-secondary)] to-[var(--accent-primary)]" />
          <span>专注学时 (h)</span>
        </div>
      </div>

      <div className="relative w-full" style={{ height: `${containerHeight}px` }}>
        {/* SVG Canvas */}
        <svg className="w-full h-full overflow-visible">
          {/* Gradients */}
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity={0.85} />
            </linearGradient>
            <linearGradient id="activeBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity={0.6} />
            </linearGradient>
          </defs>

          {/* Guidelines & Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const hVal = (chartMax * ratio).toFixed(1);
            const y = containerHeight - paddingBottom - (graphHeight * ratio);
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2="100%"
                  y2={y}
                  stroke="currentColor"
                  className="text-[var(--border-color)]"
                  strokeWidth={1}
                  strokeDasharray="4 6"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="font-mono text-[10px] fill-[var(--text-muted)] font-medium"
                >
                  {hVal}
                </text>
              </g>
            );
          })}

          {/* Render Bars */}
          {hoursData.map((hours, index) => {
            const widthPct = (100 - paddingLeft) / 7;
            const barWidthMultiplier = 0.44; // Bar thickness
            
            // X positioning
            const xOffset = paddingLeft + (index * widthPct) + (widthPct * (1 - barWidthMultiplier) / 2);
            const widthVal = widthPct * barWidthMultiplier;

            // Y height calculation
            const barHeight = hours > 0 ? (hours / chartMax) * graphHeight : 2; // subtle base pixel for zero
            const yVal = containerHeight - paddingBottom - barHeight;

            const isHovered = hoveredIndex === index;
            const isZero = hours === 0;

            return (
              <g
                key={index}
                className="cursor-pointer group"
                onClick={() => onBarClick(dates[index])}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Background Full Column Hover Receiver */}
                <rect
                  x={paddingLeft + (index * widthPct)}
                  y={paddingTop}
                  width={widthPct}
                  height={graphHeight}
                  fill="transparent"
                />

                {/* Main animated bar pillar */}
                <motion.rect
                  x={xOffset}
                  y={yVal}
                  width={widthVal}
                  height={barHeight}
                  rx={Math.min(widthVal / 2, 8)}
                  fill={isHovered ? "url(#activeBarGradient)" : "url(#barGradient)"}
                  initial={{ height: 0, y: containerHeight - paddingBottom }}
                  animate={{ height: barHeight, y: yVal }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 85, 
                    damping: 15,
                    delay: index * 0.04 
                  }}
                  className="transition-all duration-300 shadow-sm"
                  style={{
                    filter: isHovered ? "drop-shadow(0px 4px 12px var(--accent-glow))" : "none"
                  }}
                />

                {/* Little organic value bead on top */}
                {hours > 0 && !isZero && (
                  <motion.circle
                    cx={xOffset + widthVal / 2}
                    cy={yVal}
                    r={3}
                    className="fill-[var(--bg-card)] stroke-[var(--accent-primary)] stroke-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: isHovered ? 1.4 : 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* X Axis text label */}
                <text
                  x={paddingLeft + (index * widthPct) + (widthPct / 2)}
                  y={containerHeight - 12}
                  textAnchor="middle"
                  className={`
                    text-xs font-semibold select-none transition-colors duration-200
                    ${isHovered ? 'fill-[var(--accent-primary)] font-bold' : 'fill-[var(--text-muted)]'}
                  `}
                >
                  {WEEKDAYS[index]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Float Tooltip Portal (Glass Styled) */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute glass-panel p-3.5 rounded-xl border border-[var(--border-color)] shadow-xl pointer-events-none z-30 flex flex-col gap-1 text-xs"
              style={{
                left: `${Math.min(
                  Math.max(
                    10, 
                    paddingLeft + (hoveredIndex * (100 - paddingLeft) / 7) + 5
                  ), 
                  80
                )}%`,
                top: `${Math.max(
                  15, 
                  containerHeight - paddingBottom - ((hoursData[hoveredIndex] / chartMax) * graphHeight) - 82
                )}px`,
              }}
            >
              <div className="flex items-center gap-1.5 font-bold text-[var(--text-main)] font-display">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>{WEEKDAYS[hoveredIndex]} 专注纪实</span>
              </div>
              <div className="text-[10px] text-muted">
                {dates[hoveredIndex]}
              </div>
              <div className="font-mono text-base font-extrabold text-[var(--text-main)] mt-1 flex items-baseline gap-0.5">
                <span>{hoursData[hoveredIndex].toFixed(1)}</span>
                <span className="text-xs text-muted font-normal">小时</span>
                {hoursData[hoveredIndex] >= 4 && (
                  <span className="ml-1.5 inline-flex items-center px-1 py-0.5 rounded bg-orange-500/10 text-orange-500 text-[9px] font-bold gap-0.5">
                    <Flame className="w-2.5 h-2.5 fill-current" /> High Flow
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
