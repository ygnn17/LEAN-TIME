/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Hourglass, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  Download, 
  Upload, 
  Target, 
  Sparkles,
  CalendarDays,
  FileCheck2,
  Calendar,
  Layers,
  HeartPulse
} from 'lucide-react';

import { 
  ThemeType, 
  ViewType, 
  StudyRecord, 
  UserGoals, 
  AICoachAnalysis, 
  DEFAULT_GOALS 
} from './types';

import ThemeSelector from './components/ThemeSelector';
import WeekChart from './components/WeekChart';
import MonthCalendar from './components/MonthCalendar';
import RegisterModal from './components/RegisterModal';
import GoalModal from './components/GoalModal';
import AICoachPanel from './components/AICoachPanel';

const SEED_RECORDS: StudyRecord = {
  // Set up some realistic premium seeded learning data for the last 15 days so the dashboard looks loaded & elite
  '2026-06-08': 3.5,
  '2026-06-09': 4.0,
  '2026-06-10': 5.5,
  '2026-06-11': 2.0,
  '2026-06-12': 6.5,
  '2026-06-13': 8.0,
  '2026-06-14': 0.0,
  '2026-06-15': 4.5,
  '2026-06-16': 5.0, // Today
};

export default function App() {
  // Global React states
  const [records, setRecords] = useState<StudyRecord>({});
  const [theme, setTheme] = useState<ThemeType>('light-minimal');
  const [view, setView] = useState<ViewType>('week');
  const [goals, setGoals] = useState<UserGoals>(DEFAULT_GOALS);
  const [navDate, setNavDate] = useState<Date>(new Date('2026-06-16')); // anchor centered on simulated today

  // App overlay controls
  const [selectedDateForRegister, setSelectedDateForRegister] = useState<string>('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isGoalOpen, setIsGoalOpen] = useState(false);

  // AI analysis engine state
  const [aiAnalysis, setAiAnalysis] = useState<AICoachAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  // 1. Initial hydration
  useEffect(() => {
    const local = localStorage.getItem('lean_study_dashboard_v3');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.records) setRecords(parsed.records);
        if (parsed.theme) {
          setTheme(parsed.theme);
          document.documentElement.setAttribute('data-theme', parsed.theme);
        } else {
          document.documentElement.setAttribute('data-theme', 'light-minimal');
        }
        if (parsed.goals) setGoals(parsed.goals);
        if (parsed.view) setView(parsed.view);
      } catch (e) {
        console.error('Failed to parse local storage key', e);
        // Fallback seed
        setRecords(SEED_RECORDS);
        document.documentElement.setAttribute('data-theme', 'light-minimal');
      }
    } else {
      // Warm start: seeds data on first loading
      setRecords(SEED_RECORDS);
      localStorage.setItem('lean_study_dashboard_v3', JSON.stringify({
        records: SEED_RECORDS,
        theme: 'light-minimal',
        goals: DEFAULT_GOALS,
        view: 'week'
      }));
      document.documentElement.setAttribute('data-theme', 'light-minimal');
    }
  }, []);

  // Save states to Local Storage on changes
  const saveState = (updatedRecords: StudyRecord, updatedTheme: ThemeType, updatedGoals: UserGoals, updatedView: ViewType) => {
    localStorage.setItem('lean_study_dashboard_v3', JSON.stringify({
      records: updatedRecords,
      theme: updatedTheme,
      goals: updatedGoals,
      view: updatedView
    }));
  };

  // Switch Theme
  const handleChangeTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    saveState(records, newTheme, goals, view);
  };

  // Switch View Tab
  const handleSwitchView = (newView: ViewType) => {
    setView(newView);
    saveState(records, theme, goals, newView);
  };

  // Triggering the AI Diagnosis Engine from Express proxy
  const performAIDiagnosis = async (activeRecords: StudyRecord, activeGoals: UserGoals, activeView: ViewType, activeNav: Date) => {
    setAiLoading(true);
    try {
      const stats = getActiveMetrics(activeRecords, activeGoals, activeView, activeNav);
      
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalHours: stats.totalHours,
          avgHours: stats.avgHours,
          activeDays: stats.activeDays,
          maxDayHours: stats.maxDayHours,
          maxDayName: stats.maxDayName,
          viewType: activeView,
          dateRange: stats.rangeLabel,
          recordsSlice: stats.recordsSlice,
        }),
      });

      const payload = await res.json();
      if (payload.success) {
        setAiAnalysis(payload.analysis);
        setIsFallback(payload.isFallback || false);
      } else {
        throw new Error(payload.message || 'Error executing API request');
      }
    } catch (err) {
      console.error('Failed to trigger server-side Gemini intelligence:', err);
      // Construct a premium edge state fallback in-case
      const stats = getActiveMetrics(activeRecords, activeGoals, activeView, activeNav);
      const isWeekly = activeView === 'week';
      
      // Standalone heuristics
      const mockResult: AICoachAnalysis = {
        patternTitle: stats.totalHours > 0 ? "自律心流在野" : "精力静止画布",
        patternContent: stats.totalHours > 0 
          ? `分析显示您本期累计录入 ${stats.totalHours.toFixed(1)}h 专注。时间分布呈现典型的稳定专注，打卡率为 ${(stats.activeDays / (isWeekly ? 7 : 30) * 100).toFixed(0)}%。这是极佳的大脑稳态。`
          : "暂无学时，请选择顶部或侧边快速登记，解锁基于前额叶心流的认知自律报告。",
        strengthTitle: `峰值高光日: ${stats.maxDayName}`,
        strengthContent: `在这一天，您完成了 ${stats.maxDayHours.toFixed(1)} 小时的深度负荷，表明极高的时间主权，值得自我奖励。`,
        actionTitle: "极速自愈自律药方",
        actionPoints: [
          "番茄微退火：每学习45分钟闭眼静坐2分钟，恢复视觉对比度。",
          "时空断线锚定：学习时剥离一切手机杂讯，让物理书桌变成信息孤岛。",
          "周期软着陆：下周期开始时前3小时仅处理低荷载工作，实现皮层过渡。"
        ],
        metricsContext: "“秩序感是消除认知摩擦最好的溶剂。”",
        generatedAt: new Date().toLocaleTimeString()
      };
      setAiAnalysis(mockResult);
      setIsFallback(true);
    } finally {
      setAiLoading(false);
    }
  };

  // Calculate days list for a week
  const getWeekDates = (baseDate: Date): string[] => {
    const d = new Date(baseDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as 1st element
    const monday = new Date(d.setDate(diff));

    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const temp = new Date(monday);
      temp.setDate(monday.getDate() + i);
      weekDates.push(temp.toISOString().split('T')[0]);
    }
    return weekDates;
  };

  // Extract core visual Metrics based on active view state
  const getActiveMetrics = (currentRecords: StudyRecord, currentGoals: UserGoals, currentView: ViewType, currentNav: Date) => {
    let totalHours = 0;
    let activeDays = 0;
    let maxDayHours = 0;
    let maxDayName = '--';
    let rangeLabel = '';
    const recordsSlice: StudyRecord = {};

    const WEEKDAYS_CN = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    if (currentView === 'week') {
      const weekDates = getWeekDates(currentNav);
      const startMD = formatDateMD(weekDates[0]);
      const endMD = formatDateMD(weekDates[6]);
      rangeLabel = `${startMD} - ${endMD}`;

      weekDates.forEach((date, index) => {
        const h = currentRecords[date] || 0;
        recordsSlice[date] = h;
        totalHours += h;
        if (h > 0) {
          activeDays++;
        }
        if (h > maxDayHours) {
          maxDayHours = h;
          maxDayName = WEEKDAYS_CN[index];
        }
      });
    } else {
      const year = currentNav.getFullYear();
      const month = currentNav.getMonth();
      const totalDays = new Date(year, month + 1, 0).getDate();
      rangeLabel = `${year}年 ${month + 1}月`;

      for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const h = currentRecords[dateStr] || 0;
        recordsSlice[dateStr] = h;
        totalHours += h;
        if (h > 0) {
          activeDays++;
        }
        if (h > maxDayHours) {
          maxDayHours = h;
          const weekdayIdx = new Date(dateStr).getDay();
          const adjustedWd = weekdayIdx === 0 ? 6 : weekdayIdx - 1;
          maxDayName = `${d}号 (${WEEKDAYS_CN[adjustedWd]})`;
        }
      }
    }

    const avgHours = activeDays > 0 ? parseFloat((totalHours / activeDays).toFixed(1)) : 0;
    const goalRatio = currentView === 'week' ? currentGoals.weeklyGoal : currentGoals.monthlyGoal;
    const progressRatio = Math.round((totalHours / goalRatio) * 100);

    return {
      totalHours: parseFloat(totalHours.toFixed(1)),
      avgHours,
      activeDays,
      maxDayHours,
      maxDayName,
      rangeLabel,
      progressRatio,
      goalLimit: goalRatio,
      recordsSlice,
    };
  };

  const activeStats = getActiveMetrics(records, goals, view, navDate);

  // Trigger Gemini analysis automatically on base dataset updates
  useEffect(() => {
    if (Object.keys(records).length > 0) {
      performAIDiagnosis(records, goals, view, navDate);
    }
  }, [records, view, navDate]);

  // Navigate time period
  const handleNavigatePeriod = (direction: number) => {
    const nextDate = new Date(navDate);
    if (view === 'week') {
      nextDate.setDate(navDate.getDate() + direction * 7);
    } else {
      nextDate.setMonth(navDate.getMonth() + direction);
    }
    setNavDate(nextDate);
  };

  // Log study time confirm
  const handleRegisterConfirm = (selectedDate: string, hours: number) => {
    const updated = { ...records };
    if (hours <= 0) {
      delete updated[selectedDate];
    } else {
      updated[selectedDate] = hours;
    }
    setRecords(updated);
    saveState(updated, theme, goals, view);
    setIsRegisterOpen(false);
  };

  // Open scheduler directly on day click
  const handleDaySelect = (dayDateStr: string) => {
    setSelectedDateForRegister(dayDateStr);
    setIsRegisterOpen(true);
  };

  // Save Goal
  const handleSaveGoal = (updatedGoals: UserGoals) => {
    setGoals(updatedGoals);
    saveState(records, theme, updatedGoals, view);
    setIsGoalOpen(false);
  };

  // Backup data export
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({ records, goals, theme, view, version: 'V3' })
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `leantime_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Backup data import
  const handleImportData = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (readerEvent: any) => {
        try {
          const content = JSON.parse(readerEvent.target.result);
          if (content.records) {
            setRecords(content.records);
            if (content.theme) {
              setTheme(content.theme);
              document.documentElement.setAttribute('data-theme', content.theme);
            }
            if (content.goals) setGoals(content.goals);
            if (content.view) setView(content.view);
            saveState(content.records, content.theme || theme, content.goals || goals, content.view || view);
            alert('🎉 您的自律备份文件已成功恢复并重新同步！');
          } else {
            alert('无效的备份文件结构，请确保这是由 Lean Time 导出的备份！');
          }
        } catch (err) {
          alert('解析备份失败！请确保文件格式为 JSON 配置文件。');
        }
      };
    };
    fileInput.click();
  };

  function formatDateMD(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }

  return (
    <div className="min-h-screen flex flex-col pb-28 lg:pb-10 transition-colors duration-500 overflow-x-hidden selection:bg-[var(--accent-primary)] selection:text-white">
      
      {/* 顶部高奢导航标 */}
      <header className="custom-card border-b border-[var(--border-color)] py-4.5 px-4 sm:px-8 mb-6 sticky top-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo 与设计副标题 */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--accent-light)] text-[var(--accent-primary)] flex items-center justify-center shadow-inner transition duration-500">
              <Compass className="w-5.5 h-5.5 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-widest font-display text-main uppercase">
                LEAN TIME
              </h1>
              <p className="text-[10px] text-muted tracking-widest font-medium uppercase mt-0.5">
                极简高奢个人时间展板
              </p>
            </div>
          </div>
          
          {/* 实时控制器 */}
          <div className="flex flex-wrap items-center gap-4 justify-center">
            
            {/* View tab switchers */}
            <div className="flex bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] p-1 rounded-xl">
              <button
                onClick={() => handleSwitchView('week')}
                className={`
                  px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 select-none
                  ${view === 'week' 
                    ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-bold border border-[var(--border-color)]/5 md:px-5' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }
                `}
              >
                周视图
              </button>
              <button
                onClick={() => handleSwitchView('month')}
                className={`
                  px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 select-none
                  ${view === 'month' 
                    ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs font-bold border border-[var(--border-color)]/5 md:px-5' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }
                `}
              >
                月视图
              </button>
            </div>

            {/* Premium Theme selector */}
            <ThemeSelector currentTheme={theme} onChangeTheme={handleChangeTheme} />

          </div>
        </div>
      </header>

      {/* Main Structural Layout Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ===================== 左侧自律控制区域 (4 Columns) ===================== */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Logging button (Exclusive on PC size layouts) */}
            <div className="hidden lg:block">
              <button
                onClick={() => {
                  setSelectedDateForRegister(new Date().toISOString().split('T')[0]);
                  setIsRegisterOpen(true);
                }}
                className="
                  w-full py-4.5 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-bold 
                  tracking-wider transition-all duration-300 hover:scale-[1.02] shadow-[0_6px_20px_var(--accent-glow)] flex items-center justify-center gap-2 select-none active:scale-[0.99]
                "
              >
                <PlusCircle className="w-5 h-5" />
                <span>登记今日学习</span>
              </button>
            </div>

            {/* Time period switcher dashboard */}
            <div className="custom-card rounded-2xl p-5 flex items-center justify-between">
              <button
                onClick={() => handleNavigatePeriod(-1)}
                className="p-2.5 rounded-xl border border-[var(--border-color)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)] transition active:scale-95 cursor-pointer selection:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <span className="text-sm font-extrabold tracking-wide text-main font-display">
                  {activeStats.rangeLabel}
                </span>
                <p className="text-[9px] text-[var(--text-muted)] tracking-wider mt-0.5 uppercase font-bold">
                  {view === 'week' ? 'Weekly Outlook' : 'Monthly Tracker'}
                </p>
              </div>
              <button
                onClick={() => handleNavigatePeriod(1)}
                className="p-2.5 rounded-xl border border-[var(--border-color)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)] transition active:scale-95 cursor-pointer selection:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Primary numeric metrics readout */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 select-none">
              
              {/* Stat 1: Total Study hours */}
              <div className="custom-card rounded-2xl p-5 flex items-center justify-between relative overflow-hidden transition duration-500 hover:scale-[1.02]">
                <div>
                  <p className="text-[10px] text-muted font-bold tracking-wide uppercase">累计专注时长</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-extrabold text-main font-display tracking-tight">
                      {activeStats.totalHours.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted font-medium font-display">h</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] text-[var(--text-muted)]">
                  <Hourglass className="w-4.5 h-4.5" />
                </div>
              </div>

              {/* Stat 2: Daily avg learning time */}
              <div className="custom-card rounded-2xl p-5 flex items-center justify-between relative overflow-hidden transition duration-500 hover:scale-[1.02]">
                <div>
                  <p className="text-[10px] text-muted font-bold tracking-wide uppercase">打卡均值强度</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-extrabold text-main font-display tracking-tight">
                      {activeStats.avgHours.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted font-medium font-display">h/天</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] text-[var(--text-muted)]">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
              </div>

            </div>

            {/* Target ratios progress visual readout */}
            <div className="custom-card rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-bold text-muted tracking-wide uppercase">本期目标进度</span>
                <span className="text-xs text-[var(--accent-primary)] font-extrabold tracking-wide font-display">
                  {activeStats.progressRatio}%
                </span>
              </div>
              
              {/* Progress bar tracks */}
              <div className="w-full bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)]/20 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(activeStats.progressRatio, 100)}%` }}
                  transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                  className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] h-[7px] rounded-full"
                />
              </div>

              <div className="flex justify-between items-center mt-3">
                <span className="text-[10px] text-muted font-medium">
                  {activeStats.totalHours >= activeStats.goalLimit ? (
                    <span className="text-[var(--accent-primary)] font-bold flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 inline" /> 卓越！已超额达成目标！
                    </span>
                  ) : (
                    <span>距离目标还差 <strong className="font-bold text-[var(--text-main)] font-mono">{(activeStats.goalLimit - activeStats.totalHours).toFixed(1)}</strong> 小时</span>
                  )}
                </span>
                <button
                  onClick={() => setIsGoalOpen(true)}
                  className="text-xs text-[var(--accent-primary)] hover:brightness-95 underline font-bold transition select-none tracking-wide"
                >
                  设定
                </button>
              </div>
            </div>

            {/* Backup configs */}
            <div className="custom-card rounded-2xl p-4.5 flex items-center justify-between text-xs transition duration-500">
              <span className="text-muted tracking-wide font-medium">自律资产本地容灾</span>
              <div className="flex gap-3">
                <button
                  onClick={handleExportData}
                  className="text-[var(--accent-primary)] hover:brightness-95 transition flex items-center gap-1 font-bold select-none cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> 导出备份
                </button>
                <div className="w-[1px] h-3.5 bg-[var(--border-color)]" />
                <button
                  onClick={handleImportData}
                  className="text-[var(--accent-primary)] hover:brightness-95 transition flex items-center gap-1 font-bold select-none cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> 还原
                </button>
              </div>
            </div>

          </div>

          {/* ===================== 右侧大展区图表与AI深度诊断 (8 Columns) ===================== */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <AnimatePresence mode="wait">
              {view === 'week' ? (
                /* Week panel */
                <motion.div
                  key="week-chart-container"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <WeekChart 
                    hoursData={getWeekDates(navDate).map((dateStr) => records[dateStr] || 0)} 
                    dates={getWeekDates(navDate)} 
                    onBarClick={handleDaySelect} 
                  />
                </motion.div>
              ) : (
                /* Month panel Contribution grids */
                <motion.div
                  key="month-chart-container"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <MonthCalendar 
                    navDate={navDate} 
                    records={records} 
                    onDayClick={handleDaySelect} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Diagnostics with true multi-dimensionality */}
            <AICoachPanel 
              analysis={aiAnalysis} 
              loading={aiLoading} 
              onTriggerAnalyze={() => performAIDiagnosis(records, goals, view, navDate)} 
              isFallback={isFallback}
            />

          </div>

        </div>
      </main>

      {/* ===================== 移动端 (PAD & PHONE): 底部悬浮快捷登记栏 ===================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4.5 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/95 to-transparent z-40">
        <button
          onClick={() => {
            setSelectedDateForRegister(new Date().toISOString().split('T')[0]);
            setIsRegisterOpen(true);
          }}
          className="
            w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-extrabold 
            tracking-wider shadow-xl shadow-slate-500/10 active:scale-95 transition-transform flex items-center justify-center gap-2 select-none
          "
        >
          <PlusCircle className="w-5 h-5" />
          <span>登记今日学时</span>
        </button>
      </div>

      {/* Scheduler log hours overlay */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSubmit={handleRegisterConfirm}
        defaultDate={selectedDateForRegister || new Date().toISOString().split('T')[0]}
        initialHours={records[selectedDateForRegister] || null}
      />

      {/* Goals targets setter overlay */}
      <GoalModal
        isOpen={isGoalOpen}
        onClose={() => setIsGoalOpen(false)}
        currentGoals={goals}
        activeView={view}
        onSave={handleSaveGoal}
      />

    </div>
  );
}
