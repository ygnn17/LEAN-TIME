/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PRESET_THEMES, ThemeType } from '../types';
import { Palette, Sparkles } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: ThemeType;
  onChangeTheme: (theme: ThemeType) => void;
}

export default function ThemeSelector({ currentTheme, onChangeTheme }: ThemeSelectorProps) {
  return (
    <div className="flex bg-slate-200/40 dark:bg-black/30 p-1.5 rounded-xl border border-[var(--border-color)] items-center gap-1">
      <div className="hidden sm:flex items-center gap-1.5 px-2 text-xs font-medium text-[var(--text-muted)]">
        <Palette className="w-3.5 h-3.5" />
        <span>风格</span>
      </div>
      <div className="flex gap-2">
        {PRESET_THEMES.map((theme) => {
          const isActive = theme.id === currentTheme;
          return (
            <button
              key={theme.id}
              onClick={() => onChangeTheme(theme.id)}
              className={`
                relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1.5 select-none
                ${isActive 
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm border border-[var(--border-color)]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]/40'
                }
              `}
              title={`${theme.name}: ${theme.desc}`}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full block border border-black/5" 
                style={{ backgroundColor: theme.color }}
              />
              <span className="hidden md:inline text-[11px] font-medium">{theme.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
