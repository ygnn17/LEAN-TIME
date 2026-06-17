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
import SettingsMenu from './components/SettingsMenu';
import LLMConfigModal from './components/LLMConfigModal';

export default function App() {
  // Global React states with lazy state initializers to guarantee persistent state from localStorage immediately on first render
  const [records, setRecords] = useState<StudyRecord>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('lean_study_dashboard_v3');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed.records) return parsed.records;
        } catch (e) {
          console.error('Error initializing records state', e);
        }
      }
    }
    return {};
  });

  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('lean_study_dashboard_v3');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed.theme) return parsed.theme;
        } catch (e) {
          console.error('Error initializing theme state', e);
        }
      }
    }
    return 'light-minimal';
  });

  const [view, setView] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('lean_study_dashboard_v3');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed.view) return parsed.view;
        } catch (e) {
          console.error('Error initializing view state', e);
        }
      }
    }
    return 'week';
  });

  const [goals, setGoals] = useState<UserGoals>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('lean_study_dashboard_v3');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed.goals) return parsed.goals;
        } catch (e) {
          console.error('Error initializing goals state', e);
        }
      }
    }
    return DEFAULT_GOALS;
  });

  const [navDate, setNavDate] = useState<Date>(new Date()); // anchor centered on today

  // App overlay controls
  const [selectedDateForRegister, setSelectedDateForRegister] = useState<string>('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [isLLMConfigOpen, setIsLLMConfigOpen] = useState(false);

  // AI analysis engine state
  const [analysisMode, setAnalysisMode] = useState<'local' | 'ai'>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('lean_study_dashboard_v3');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed.analysisMode) return parsed.analysisMode;
        } catch (e) {
          console.error('Error initializing analysisMode state', e);
        }
      }
    }
    return 'ai';
  });

  const [aiAnalysis, setAiAnalysis] = useState<AICoachAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  // 1. Initial document layout & theme hydration on mount
  useEffect(() => {
    const local = localStorage.getItem('lean_study_dashboard_v3');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.theme) {
          document.documentElement.setAttribute('data-theme', parsed.theme);
        } else {
          document.documentElement.setAttribute('data-theme', 'light-minimal');
        }
      } catch (e) {
        console.error('Failed to parse local storage theme', e);
        document.documentElement.setAttribute('data-theme', 'light-minimal');
      }
    } else {
      // Warm start: write initial defaults once on the absolute first mount and prepare Theme style
      localStorage.setItem('lean_study_dashboard_v3', JSON.stringify({
        records: {},
        theme: 'light-minimal',
        goals: DEFAULT_GOALS,
        view: 'week',
        analysisMode: 'ai'
      }));
      document.documentElement.setAttribute('data-theme', 'light-minimal');
    }
  }, []);

  // Save states to Local Storage on changes
  const saveState = (updatedRecords: StudyRecord, updatedTheme: ThemeType, updatedGoals: UserGoals, updatedView: ViewType, updatedMode: 'local' | 'ai') => {
    localStorage.setItem('lean_study_dashboard_v3', JSON.stringify({
      records: updatedRecords,
      theme: updatedTheme,
      goals: updatedGoals,
      view: updatedView,
      analysisMode: updatedMode
    }));
  };

  // Switch Theme
  const handleChangeTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    saveState(records, newTheme, goals, view, analysisMode);
  };

  // Switch View Tab
  const handleSwitchView = (newView: ViewType) => {
    setView(newView);
    saveState(records, theme, goals, newView, analysisMode);
  };

  // Switch Analysis Mode
  const handleSwitchAnalysisMode = (newMode: 'local' | 'ai') => {
    setAnalysisMode(newMode);
    saveState(records, theme, goals, view, newMode);
    performAIDiagnosis(records, goals, view, navDate, newMode);
  };

  // Helper Client feedback generator for standard offline use
  const generateClientFeedback = (
    viewType: string,
    total: number,
    avg: number,
    activeDays: number,
    maxDay: number,
    maxDayName: string,
    rangeLabel: string
  ): AICoachAnalysis => {
    const generatedStr = new Date().toLocaleTimeString();
    if (total === 0) {
      return {
        patternTitle: "准备启航的未来之火 🚀",
        patternContent: "哇！新的一篇自律日历正在等待你写下第一笔呢。只要随便记下一小段专注时刻，系统的自研诊断就会为你点亮！准备好给自己来个正能量的开局了吗？",
        strengthTitle: "蓄势待发的心流",
        strengthContent: "每一次点击都是一个美好的开始。不用有心理负担，今天就先定一个小小的20分钟番茄钟试试看吧！",
        actionTitle: "温柔的新手建议",
        actionPoints: [
          "迈出第一小步：设定一个只要努力2分钟就能搞定的小任务，比如整理课桌或翻开书本第一页。",
          "物理隔离干扰：把手机调成静音并放到视线之外，这样能大幅减少想要拿起来的冲动哦。",
          "对自己微笑一下：专注是送给未来的最好礼物，无论多短都值得为自己感到骄傲！"
        ],
        metricsContext: "“种下一棵树最好的时间是十年前，其次是现在。加油，我们一起出发！”",
        generatedAt: generatedStr
      };
    }

    const isWeekly = viewType === 'week';

    if (isWeekly) {
      if (avg >= 5) {
        return {
          patternTitle: "自律与效率并存的行动先锋! 🌟",
          patternContent: `本期你的累计专注时长达到了非常惊人的 ${total.toFixed(1)} 小时，日均专注也有 ${avg.toFixed(1)} 小时！这样的出众毅力和高效节奏，真的太让人佩服了！你像一台稳定而高产的‘心流发动机’，正在朝着梦想狂奔呢！`,
          strengthTitle: `高能日高光锚点: ${maxDayName}`,
          strengthContent: `在这一天，你一口气全身心投入了 ${maxDay.toFixed(1)} 小时！这不仅体现出你超凡的深层动力，更说明你的心流承受力拉满。这绝对是你当之无愧的高能时刻！`,
          actionTitle: "更上一层楼的温柔叮嘱",
          actionPoints: [
            "适时休息必不可少：每深层学习45-50分钟，记得站起来伸个懒腰、喝口温水或眺望远方3分钟，保护好专注的本钱。",
            "给自己一个实在的赞赏：在完成阶段性高度专注后，吃一顿美食或看一集喜欢的剧，让大脑把‘专注’和‘愉悦’深度绑定。",
            "注重专注的纯度：如果有些倦怠，可以适当调低时长要求，高品质、无杂念的短心流同样是非常高级的打法。"
          ],
          metricsContext: "“在自律的道路上合拍奔跑时，也别忘了沿途美丽的风景。休息好才能走得更远哦！”",
          generatedAt: generatedStr
        };
      } else if (activeDays >= 5) {
        return {
          patternTitle: "持之习惯的追光者 🌿",
          patternContent: `虽然每次专注时间比较温和（日均 ${avg.toFixed(1)} 小时），但你本周积极打卡了 ${activeDays} 天！这种‘细水长流’、‘高频稳态’的节奏简直是最健康的自我管理方式！习惯的力量一旦形成复利，未来的成就将无可限量！`,
          strengthTitle: "默默蓄力的心流瞬间",
          strengthContent: `${maxDayName} 属于你本周效率的轻微峰值（${maxDay.toFixed(1)}小时），但在大体保持平稳的情况下展现微小的波动，说明你十分善于顺应自身的精力潮汐。`,
          actionTitle: "让动力更蓬勃的小提点",
          actionPoints: [
            "尝试一次温和的小突破：下周可以挑选随机一天作为‘趣味挑战日’，比如尝试比平常多专注30分钟，敲敲舒适区的边界。",
            "打造专属的心流仪式感：进入专注前点一盏暖色的小台灯，或者倒一杯暖手燕麦，引导大脑快速进入平和期待状态。",
            "感恩那个默默坚持的自己：每天记录学时之后，对自己说一句‘我又前进一步了，今天也是元气满满的自己’。"
          ],
          metricsContext: "“水滴穿石，最伟大的力量往往来自于每天不着痕迹的坚持。”",
          generatedAt: generatedStr
        };
      } else {
        return {
          patternTitle: "蓄势突围的爆发型选手 💫",
          patternContent: `你属于典型的‘高能量爆发型’！虽然平时可能稍微有些随性，但一到关键时刻（比如 ${maxDayName}），你就能一口气爆发出 ${maxDay.toFixed(1)} 小时的超强战斗力！这代表你的内心深处有着巨大的爆发性心流潜能，只是平常启动成本略高、节奏有待匀称。`,
          strengthTitle: "惊艳的爆发高光点",
          strengthContent: `单日 ${maxDay.toFixed(1)} 小时的全力以赴，再次证明你具备惊人的高专注耐受。别小看这个火苗，它是你随时可以调动的底层心流能量配置！`,
          actionTitle: "击碎‘起步难与拖延’的物理小妙招",
          actionPoints: [
            "著名的两分钟黄金法则：感到万事起头难时，对自己说‘我就只学两分钟，完了立刻去玩’。一旦越过了开头，往往就能学下去！",
            "将学习和日常惯例锁死：在一项雷打不动的基础惯例后紧接专注。例如：‘洗漱完喝热水后，立刻在窗边安静看完5页书’。",
            "降低心理包袱：用无负担的小番茄钟（如15分钟）来替代沉重的高难度学习，消除潜意识里对专注行为的天然抗拒。"
          ],
          metricsContext: "“战胜拖延的秘诀，就在于放下完美主义，欢快地迈出那微不足道的第一步。”",
          generatedAt: generatedStr
        };
      }
    } else {
      // Month analysis fallbacks
      if (total >= 60) {
        return {
          patternTitle: "坚韧卓越的长周期掌控者 🏆",
          patternContent: `太优秀了！本月累积专注高达 ${total.toFixed(1)} 小时，活跃天数有 ${activeDays} 天。这已经不是普通的坚持了，这简直是把主宰时间刻进了你的习惯基因里。这种长周期深耕，定会带来惊人蜕变！`,
          strengthTitle: `高维极值日: ${maxDayName}`,
          strengthContent: `本月最高单日专注达到了 ${maxDay.toFixed(1)} 小时，像一座耀眼的奇峰，树立在你的整月自律高原之上，见证了你极强的意志堡垒。`,
          actionTitle: "长线航行的元气保养指南",
          actionPoints: [
            "在周末开启彻底的‘放空日’：挑选一天完全断电、不看计划、不记学习，到森林公园漫步或好好睡饱，让身心充分复苏。",
            "写下属于自己的成就手记：将完成的几大成果列出，用看得见的实体进度满足自尊，而不是仅仅依靠冷冰冰的数字长度。",
            "和同频的伙伴分享喜悦：分享你充沛的行动模式，在交流和相互肯定中收获社交的正向多巴胺增强。"
          ],
          metricsContext: "“真正的自律是一种生活常态，如微风、如流水，温顺而不可阻挡。”",
          generatedAt: generatedStr
        };
      } else {
        return {
          patternTitle: "寻找专属节律的潜能筑梦人 🎨",
          patternContent: `本月在穿插各种事务之余，你顺利累计了 ${total.toFixed(1)} 小时的专注，打卡了 ${activeDays} 天！虽然时间分布有些波动，但你依然高频地留存着自律火种。你正积极探索最舒适的生活步调，这是一个非常美妙的过程！`,
          strengthTitle: "月度进程中的高能高光",
          strengthContent: `在 ${maxDayName} 时，你成功夺回了 ${maxDay.toFixed(1)} 小时的专属主权，说明你的高效潜能依然源源不断，只要合理调频，就随时能点亮整张精彩的时间拼图！`,
          actionTitle: "零负担平稳起航的稳态攻略",
          actionPoints: [
            "物理视域锚定：把你的纸质目标本或正在看的书籍始终呈开卷状态放在书桌中央，作为被动的善意心流召集媒介。",
            "温柔的周目标：如果月目标感觉太大，可以降维打击，拆分成‘每周温和学习10小时’，让任务变得轻松、没有焦虑感。",
            "打卡视觉化放大：用亮色笔在实体墙面日历记录，那一个个连贯的高亮色块，是抵抗意志消磨极有成效的心理激励武器。"
          ],
          metricsContext: "“不管步伐是大是小，只要你不停下脚步，就永远比昨天的自己更进一步。”",
          generatedAt: generatedStr
        };
      }
    }
  };

  // Triggering the AI Diagnosis Engine from Express proxy
  const performAIDiagnosis = async (activeRecords: StudyRecord, activeGoals: UserGoals, activeView: ViewType, activeNav: Date, forceMode?: 'local' | 'ai') => {
    const activeMode = forceMode || analysisMode;
    const stats = getActiveMetrics(activeRecords, activeGoals, activeView, activeNav);

    if (activeMode === 'local') {
      setAiLoading(true);
      setTimeout(() => {
        const localReport = generateClientFeedback(activeView, stats.totalHours, stats.avgHours, stats.activeDays, stats.maxDayHours, stats.maxDayName, stats.rangeLabel);
        setAiAnalysis(localReport);
        setIsFallback(true);
        setAiLoading(false);
      }, 550); // Small delay for beautiful processing scanner effect
      return;
    }

    setAiLoading(true);
    try {
      // Fetch custom LLM credential settings
      let customConfigToSend = null;
      try {
        const stored = localStorage.getItem('lean_study_api_config');
        if (stored) {
          const parsed = JSON.parse(stored);
          const activeProv = parsed.activeProvider;
          if (activeProv && parsed[activeProv]) {
            const details = parsed[activeProv];
            if (details.apiKey) {
              customConfigToSend = {
                provider: activeProv,
                apiKey: details.apiKey,
                model: details.model
              };
            }
          }
        }
      } catch (errConfig) {
        console.error('Error fetching client credentials', errConfig);
      }

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
          customConfig: customConfigToSend,
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
      const fallbackReport = generateClientFeedback(activeView, stats.totalHours, stats.avgHours, stats.activeDays, stats.maxDayHours, stats.maxDayName, stats.rangeLabel);
      setAiAnalysis(fallbackReport);
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
        const rawVal = currentRecords[date];
        let h = 0;
        if (typeof rawVal === 'number') {
          h = rawVal;
        } else if (rawVal) {
          h = (rawVal.day || 0) + (rawVal.night || 0);
        }
        recordsSlice[date] = rawVal || { day: 0, night: 0 };
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
        const rawVal = currentRecords[dateStr];
        let h = 0;
        if (typeof rawVal === 'number') {
          h = rawVal;
        } else if (rawVal) {
          h = (rawVal.day || 0) + (rawVal.night || 0);
        }
        recordsSlice[dateStr] = rawVal || { day: 0, night: 0 };
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

  const weekStats = getActiveMetrics(records, goals, 'week', navDate);
  const monthStats = getActiveMetrics(records, goals, 'month', navDate);
  const activeStats = view === 'week' ? weekStats : monthStats;

  // Trigger Gemini analysis automatically on base dataset updates
  useEffect(() => {
    if (Object.keys(records).length > 0) {
      performAIDiagnosis(records, goals, view, navDate);
    }
  }, [records, view, navDate, analysisMode]);

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

  // Log study time confirm (Day & Night split)
  const handleRegisterConfirm = (
    selectedDate: string,
    dayHours: number,
    nightHours: number,
    leaveType?: 'normal' | 'special',
    leaveReason?: string
  ) => {
    const updated = { ...records };
    if (dayHours <= 0 && nightHours <= 0 && !leaveType) {
      delete updated[selectedDate];
    } else {
      updated[selectedDate] = {
        day: dayHours,
        night: nightHours,
        ...(leaveType ? { leaveType, leaveReason } : {})
      };
    }
    setRecords(updated);
    saveState(updated, theme, goals, view, analysisMode);
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
    saveState(records, theme, updatedGoals, view, analysisMode);
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
            saveState(content.records, content.theme || theme, content.goals || goals, content.view || view, content.analysisMode || analysisMode);
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

  // Initialize and Reset everything to zero
  const handleResetData = () => {
    const confirmWipe = window.confirm('❗ 您确定要彻底清空此工具内所有自律打卡数据、学习历史记录及 API 秘钥配置吗？此操作不可撤销，系统将彻底恢复至出厂初始状态！');
    if (!confirmWipe) return;

    // Reset components reactively to seeded clean version of empty
    setRecords({});
    setTheme('light-minimal');
    setGoals(DEFAULT_GOALS);
    setView('week');
    setAnalysisMode('local');
    setAiAnalysis(null);

    // Document styling reset
    document.documentElement.setAttribute('data-theme', 'light-minimal');

    // Wipe storage
    localStorage.removeItem('lean_study_dashboard_v3');
    localStorage.removeItem('lean_study_api_config');

    alert('🎉 学习历史记录、大模型 API 密钥以及全局配置均已彻底成功清零，已恢复到初始空展板状态！');
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

            {/* Custom Settings dropdown */}
            <SettingsMenu
              onOpenLLMConfig={() => setIsLLMConfigOpen(true)}
              onImportData={handleImportData}
              onExportData={handleExportData}
              onResetData={handleResetData}
            />

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

            {/* Target ratios progress visual readout (Upgraded to Dual Goal Dashboard) */}
            <div className="custom-card rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--border-color)]/60 pb-2">
                <span className="text-xs font-bold text-muted tracking-wide uppercase">目标计划完成度</span>
                <button
                  onClick={() => setIsGoalOpen(true)}
                  className="text-xs text-[var(--accent-primary)] hover:brightness-95 underline font-bold transition select-none tracking-wide cursor-pointer"
                >
                  设定目标
                </button>
              </div>

              {/* 1. 周计划进度 */}
              <div className={`p-3 rounded-xl border transition ${view === 'week' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/[0.02] shadow-[inset_0_0_8px_rgba(16,185,129,0.02)]' : 'border-[var(--border-color)]/50 bg-slate-50/20 dark:bg-slate-900/10'}`}>
                <div className="flex justify-between items-center mb-1.5 text-xs">
                  <span className="font-bold flex items-center gap-1 text-[var(--text-main)]">
                    <span>周计划进度</span>
                    {view === 'week' && (
                      <span className="text-[9px] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-1.5 py-0.5 rounded-md font-bold scale-90">当前</span>
                    )}
                  </span>
                  <span className="font-mono font-extrabold text-[var(--accent-primary)]">
                    {weekStats.progressRatio}%
                  </span>
                </div>
                
                {/* Progress track */}
                <div className="w-full bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)]/20 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(weekStats.progressRatio, 100)}%` }}
                    transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                    className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] h-full rounded-full"
                  />
                </div>

                <div className="flex justify-between items-center mt-2 text-[10px] text-muted">
                  <span>已学 {weekStats.totalHours.toFixed(1)} / {goals.weeklyGoal}h</span>
                  <span>
                    {weekStats.totalHours >= goals.weeklyGoal ? (
                      <span className="text-[var(--accent-primary)] font-bold flex items-center gap-0.5">
                        已超额达成周目标！
                      </span>
                    ) : (
                      <span>还差 <b>{(goals.weeklyGoal - weekStats.totalHours).toFixed(1)}</b>h</span>
                    )}
                  </span>
                </div>
              </div>

              {/* 2. 月计划进度 */}
              <div className={`p-3 rounded-xl border transition ${view === 'month' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/[0.02] shadow-[inset_0_0_8px_rgba(16,185,129,0.02)]' : 'border-[var(--border-color)]/50 bg-slate-50/20 dark:bg-slate-900/10'}`}>
                <div className="flex justify-between items-center mb-1.5 text-xs">
                  <span className="font-bold flex items-center gap-1 text-[var(--text-main)]">
                    <span>月计划进度</span>
                    {view === 'month' && (
                      <span className="text-[9px] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-1.5 py-0.5 rounded-md font-bold scale-90">当前</span>
                    )}
                  </span>
                  <span className="font-mono font-extrabold text-[var(--accent-primary)]">
                    {monthStats.progressRatio}%
                  </span>
                </div>
                
                {/* Progress track */}
                <div className="w-full bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)]/20 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(monthStats.progressRatio, 100)}%` }}
                    transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                    className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] h-full rounded-full"
                  />
                </div>

                <div className="flex justify-between items-center mt-2 text-[10px] text-muted">
                  <span>已学 {monthStats.totalHours.toFixed(1)} / {goals.monthlyGoal}h</span>
                  <span>
                    {monthStats.totalHours >= goals.monthlyGoal ? (
                      <span className="text-[var(--accent-primary)] font-bold flex items-center gap-0.5">
                        已超额达成月目标！
                      </span>
                    ) : (
                      <span>还差 <b>{(goals.monthlyGoal - monthStats.totalHours).toFixed(1)}</b>h</span>
                    )}
                  </span>
                </div>
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
                    dayNightRecords={getWeekDates(navDate).map((dateStr) => {
                      const r = records[dateStr];
                      if (typeof r === 'number') {
                        return { day: r, night: 0 };
                      } else if (r) {
                        return { 
                          day: r.day || 0, 
                          night: r.night || 0,
                          leaveType: r.leaveType,
                          leaveReason: r.leaveReason
                        };
                      }
                      return { day: 0, night: 0 };
                    })} 
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
              analysisMode={analysisMode}
              onSwitchMode={handleSwitchAnalysisMode}
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
        initialValue={records[selectedDateForRegister] || null}
      />

      {/* Goals targets setter overlay */}
      <GoalModal
        isOpen={isGoalOpen}
        onClose={() => setIsGoalOpen(false)}
        currentGoals={goals}
        activeView={view}
        onSave={handleSaveGoal}
      />

      {/* LLM credentials options modal */}
      <LLMConfigModal
        isOpen={isLLMConfigOpen}
        onClose={() => setIsLLMConfigOpen(false)}
        onSave={() => performAIDiagnosis(records, goals, view, navDate)}
      />

    </div>
  );
}
