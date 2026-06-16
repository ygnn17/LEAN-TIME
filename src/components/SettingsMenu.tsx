/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Key, Download, Upload, Trash2, HelpCircle } from 'lucide-react';

interface SettingsMenuProps {
  onOpenLLMConfig: () => void;
  onImportData: () => void;
  onExportData: () => void;
  onResetData: () => void;
}

export default function SettingsMenu({
  onOpenLLMConfig,
  onImportData,
  onExportData,
  onResetData
}: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Settings Gear Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-bold select-none cursor-pointer relative"
        title="设置功能菜单"
      >
        <Settings className={`w-4 h-4 text-[var(--accent-primary)] transition-transform duration-500 ${isOpen ? 'rotate-90' : ''}`} />
        <span>设置</span>
      </button>

      {/* Settings Dropdown Area */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="absolute right-0 mt-2.5 w-52 bg-white dark:bg-slate-950 border border-[var(--border-color)] rounded-2xl shadow-xl z-50 py-2 origin-top-right overflow-hidden select-none"
          >
            {/* LLM Configuration Option */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLLMConfig();
              }}
              className="w-full text-left px-4.5 py-2.5 text-xs text-[var(--text-main)] hover:bg-slate-50 dark:hover:bg-slate-900 transition flex items-center gap-2.5 font-semibold cursor-pointer"
            >
              <Key className="w-4 h-4 text-amber-500" />
              <span>大模型配置</span>
            </button>

            {/* Separator */}
            <div className="h-[1px] bg-[var(--border-color)]/60 my-1 mx-2" />

            {/* Export Study History option */}
            <button
              onClick={() => {
                setIsOpen(false);
                onExportData();
              }}
              className="w-full text-left px-4.5 py-2.5 text-xs text-[var(--text-main)] hover:bg-slate-50 dark:hover:bg-slate-900 transition flex items-center gap-2.5 font-semibold cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>导出学习历史记录</span>
            </button>

            {/* Import Study History option */}
            <button
              onClick={() => {
                setIsOpen(false);
                onImportData();
              }}
              className="w-full text-left px-4.5 py-2.5 text-xs text-[var(--text-main)] hover:bg-slate-50 dark:hover:bg-slate-900 transition flex items-center gap-2.5 font-semibold cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>导入学习历史记录</span>
            </button>

            {/* Separator */}
            <div className="h-[1px] bg-[var(--border-color)]/60 my-1 mx-2" />

            {/* System Reset Option */}
            <button
              onClick={() => {
                setIsOpen(false);
                onResetData();
              }}
              className="w-full text-left px-4.5 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition flex items-center gap-2.5 font-bold cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>初始化系统</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
