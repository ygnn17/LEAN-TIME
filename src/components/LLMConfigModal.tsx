/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Eye, EyeOff, Save, Trash2, X, Sparkles, AlertCircle } from 'lucide-react';

interface LLMConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Trigger app to reload/perf diagnosis immediately
}

export interface StoredAPIConfig {
  activeProvider: 'gemini' | 'siliconflow' | 'zhipu' | 'deepseek';
  gemini: { apiKey: string; model: string };
  siliconflow: { apiKey: string; model: string };
  zhipu: { apiKey: string; model: string };
  deepseek: { apiKey: string; model: string };
}

const DEFAULT_CONFIGS: StoredAPIConfig = {
  activeProvider: 'gemini',
  gemini: { apiKey: '', model: 'gemini-3.5-flash' },
  siliconflow: { apiKey: '', model: 'deepseek-ai/DeepSeek-V3' },
  zhipu: { apiKey: '', model: 'glm-4-flash' },
  deepseek: { apiKey: '', model: 'deepseek-chat' }
};

export default function LLMConfigModal({ isOpen, onClose, onSave }: LLMConfigModalProps) {
  const [config, setConfig] = useState<StoredAPIConfig>(DEFAULT_CONFIGS);
  const [activeTab, setActiveTab] = useState<'gemini' | 'siliconflow' | 'zhipu' | 'deepseek'>('gemini');
  
  // Specific tab input states
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Load from local storage
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('lean_study_api_config');
        if (stored) {
          const parsed = JSON.parse(stored) as StoredAPIConfig;
          
          // backwards compatibility and schema safety check
          const updated: StoredAPIConfig = {
            activeProvider: parsed.activeProvider || 'gemini',
            gemini: {
              apiKey: parsed.gemini?.apiKey || '',
              model: parsed.gemini?.model || 'gemini-3.5-flash'
            },
            siliconflow: {
              apiKey: parsed.siliconflow?.apiKey || '',
              model: parsed.siliconflow?.model || 'deepseek-ai/DeepSeek-V3'
            },
            zhipu: {
              apiKey: parsed.zhipu?.apiKey || '',
              model: parsed.zhipu?.model || 'glm-4-flash'
            },
            deepseek: {
              apiKey: parsed.deepseek?.apiKey || '',
              model: parsed.deepseek?.model || 'deepseek-chat'
            }
          };
          setConfig(updated);
          setActiveTab(updated.activeProvider);
          setApiKey(updated[updated.activeProvider].apiKey);
          setModel(updated[updated.activeProvider].model);
        } else {
          setConfig(DEFAULT_CONFIGS);
          setActiveTab('gemini');
          setApiKey('');
          setModel('gemini-3.5-flash');
        }
      } catch (e) {
        console.error('Failed to load API keys config from local storage', e);
      }
      setShowKey(false);
    }
  }, [isOpen]);

  // Sync inputs when switching tabs
  const handleTabChange = (tab: 'gemini' | 'siliconflow' | 'zhipu' | 'deepseek') => {
    // First save the current tab input to the temporary config state
    const currentConfig = { ...config };
    currentConfig[activeTab] = { apiKey, model };
    
    // Switch tab
    setActiveTab(tab);
    setApiKey(currentConfig[tab].apiKey);
    setModel(currentConfig[tab].model);
    setShowKey(false);
    setConfig(currentConfig);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Assemble final configuration state
    const finalConfig: StoredAPIConfig = {
      ...config,
      activeProvider: activeTab,
    };
    finalConfig[activeTab] = { apiKey: apiKey.trim(), model: model.trim() };

    localStorage.setItem('lean_study_api_config', JSON.stringify(finalConfig));
    onSave();
    onClose();
  };

  const handleClearCurrent = () => {
    setApiKey('');
    const defaultModel = DEFAULT_CONFIGS[activeTab].model;
    setModel(defaultModel);
    
    const updated = { ...config };
    updated[activeTab] = { apiKey: '', model: defaultModel };
    setConfig(updated);
    alert(`已清除 ${getProviderName(activeTab)} 的 API 密钥配置`);
  };

  const getProviderName = (id: string) => {
    switch (id) {
      case 'gemini': return 'Gemini';
      case 'siliconflow': return '硅基流动 (SiliconFlow)';
      case 'zhipu': return '智谱清言 (GLM)';
      case 'deepseek': return 'DeepSeek';
      default: return id;
    }
  };

  const getPlaceholderKey = (id: string) => {
    switch (id) {
      case 'gemini': return 'AIzaSy... (Gemini API 密钥)';
      case 'siliconflow': return 'sk-... (硅基流动 API 密钥)';
      case 'zhipu': return '智谱 API Key (例如：apiKey.id)';
      case 'deepseek': return 'sk-... (DeepSeek API 密钥)';
      default: return '请输入 API 密钥';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="custom-card rounded-2xl p-6 max-w-lg w-full border border-[var(--border-color)] shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Soft Ambient Aura */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--accent-primary)]/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center mb-5 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[var(--accent-light)] text-[var(--accent-primary)]">
                  <Key className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-[var(--text-main)] text-sm">
                    云端大模型 API 配置
                  </h3>
                  <p className="text-[10px] text-muted-flat mt-0.5">配置专属 Key，获取更具情绪价值的精美自律分析</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer select-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="grid grid-cols-4 gap-1 p-0.5 mb-5 bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)]/40 rounded-xl text-xs font-semibold">
              {(['gemini', 'siliconflow', 'zhipu', 'deepseek'] as const).map((prov) => {
                const hasKeySaved = prov === activeTab ? apiKey.length > 0 : config[prov]?.apiKey?.length > 0;
                return (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => handleTabChange(prov)}
                    className={`py-2 rounded-lg transition-all duration-200 select-none relative cursor-pointer ${
                      activeTab === prov
                        ? 'bg-[var(--bg-card)] text-[var(--accent-primary)] shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <span className="block truncate px-1 text-[11px]">
                      {prov === 'siliconflow' ? '硅基流动' : prov === 'zhipu' ? '智谱清言' : prov === 'deepseek' ? 'DeepSeek' : 'Gemini'}
                    </span>
                    {hasKeySaved && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              {/* API Key Input */}
              <div>
                <label className="block font-bold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider text-[10px]">
                  {getProviderName(activeTab)} API 密钥 (API Key)
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={getPlaceholderKey(activeTab)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[var(--border-color)] text-[var(--text-main)] font-mono text-xs focus:ring-1 focus:ring-[var(--accent-primary)] focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-[var(--text-main)] transition"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Model Name Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                    模型标识符 (Model Name)
                  </label>
                  <span className="text-[9px] text-[var(--text-muted)] scale-90 origin-right">支持自定义更高级模型</span>
                </div>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="例如: gemini-3.5-flash / deepseek-chat"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[var(--border-color)] text-[var(--text-main)] font-mono text-xs focus:ring-1 focus:ring-[var(--accent-primary)] focus:outline-none"
                  required
                />
              </div>

              {/* Model Note Callouts */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[var(--border-color)]/30 text-[11px] leading-relaxed text-[var(--text-muted)] space-y-1 mt-1">
                <p className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  各云端模型推荐型号 (默认填好):
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[10px] pl-1">
                  <li><b>Gemini</b>: 推荐 <code>gemini-3.5-flash</code> 或更高版本</li>
                  <li><b>硅基流动</b>: 推荐 <code>deepseek-ai/DeepSeek-V3</code></li>
                  <li><b>智谱清言</b>: 推荐 <code>glm-4-flash</code> / <code>glm-4-plus</code></li>
                  <li><b>DeepSeek</b>: 推荐使用官方渠道：<code>deepseek-chat</code></li>
                </ul>
              </div>

              {/* Security warning */}
              <div className="flex items-start gap-2 text-[10px] text-[var(--text-muted)]">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  本应用恪守完全本地化规则：您的 API 密钥均保存在您<b>个人的浏览器 localStorage 中</b>，仅在运行诊断分析时通过安全的后端容器进行合规代理，决不作任何云端日志存储或二次流失传输。
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleClearCurrent}
                  className="px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-transparent hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-[var(--text-muted)] font-semibold transition flex items-center justify-center gap-1 cursor-pointer select-none"
                  title="清除当前渠道"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清除</span>
                </button>
                <div className="flex-grow" />
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-main)] font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer select-none"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-bold tracking-wider shadow-sm hover:brightness-105 transition cursor-pointer select-none flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>开启深度诊断</span>
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
