/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ThemeType = 'light-minimal' | 'nordic-obsidian' | 'warm-oatmeal';

export type ViewType = 'week' | 'month';

export interface StudyRecord {
  [dateStr: string]: number; // Date string format "YYYY-MM-DD" -> Study hours
}

export interface UserGoals {
  weeklyGoal: number;
  monthlyGoal: number;
}

export interface AICoachAnalysis {
  patternTitle: string;
  patternContent: string;
  strengthTitle: string;
  strengthContent: string;
  actionTitle: string;
  actionPoints: string[];
  metricsContext: string;
  generatedAt: string;
}

export interface CustomLLMConfig {
  provider: 'gemini' | 'siliconflow' | 'zhipu' | 'deepseek';
  apiKey: string;
  model: string;
}

// Initial/default states helper
export const DEFAULT_GOALS: UserGoals = {
  weeklyGoal: 15,
  monthlyGoal: 60,
};

export const PRESET_THEMES: { id: ThemeType; name: string; color: string; desc: string }[] = [
  {
    id: 'light-minimal',
    name: '浅白曦光',
    color: '#10b981', // emerald
    desc: '纯粹通透的极简浅色美学',
  },
  {
    id: 'nordic-obsidian',
    name: '黑曜午夜',
    color: '#8b5cf6', // violet
    desc: '沉浸专注的极光深色夜空',
  },
  {
    id: 'warm-oatmeal',
    name: '暖沙燕麦',
    color: '#c2410c', // organic orange/stone
    desc: '温暖舒适的有机温润沙岩',
  },
];
