import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy load Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API: AI Time Diagnosis & Habits Planner
app.post("/api/ai-analyze", async (req, res) => {
  try {
    const { totalHours, avgHours, activeDays, maxDayHours, maxDayName, viewType, dateRange, recordsSlice } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // Graceful fallback to rich local rule-based heuristic coach if API key not configured yet
      const fallbackAnalysis = generateLocalFeedback(viewType, totalHours, avgHours, activeDays, maxDayHours, maxDayName, dateRange);
      return res.json({ success: true, isFallback: true, analysis: fallbackAnalysis });
    }

    const reportPrompt = `
      根据用户的专注学习时长数据，进行深度的时间秩序分析，并制定高奢自律的行为医学方案。

      时间模式元数据:
      - 当前视角: ${viewType === 'week' ? '本周视图' : '本月视图'} (${dateRange})
      - 累计专注时长: ${totalHours} 小时
      - 活跃专注天数: ${activeDays} 天
      - 单日最高产出: ${maxDayHours} 小时 (出现在: ${maxDayName})
      - 均值强度: ${avgHours} 小时/日 (仅针对学习天数计算)
      - 时间轴片段: ${JSON.stringify(recordsSlice)}

      请遵守以下文体契约:
      - 语气: 儒雅舒缓、充满洞察力、自律严谨的Zen-Style时间导师。
      - 背景: 将专注时长视为“注意力的主权宣示”与“时间资本重塑”。
      - 细节: 结合“标准差”、“精力周期律”、“注意力残余”或“帕累托分配”等高精词汇，忌讳大白话和敷衍的堆砌。
      - 字数: 紧凑有分量。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: reportPrompt,
      config: {
        systemInstruction: "你是一位兼具现代脑科学知识、认知行为医学背景以及极简禅意的时间美学管理大师。你通过客观精妙的数据，向渴求自律的学习者提供充满温度但极为专业的时间主权诊断书。",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patternTitle: { 
              type: Type.STRING, 
              description: "时间规律剖析标题，如：『脉冲型离散专注』或『线性递进精力秩序』" 
            },
            patternContent: { 
              type: Type.STRING, 
              description: "用脑科学与心理学，对当前学习时长、频率、均线进行深度批判与解构，约120字" 
            },
            strengthTitle: { 
              type: Type.STRING, 
              description: "自律亮点或能量核标题，如：『峰值高光锚点』" 
            },
            strengthContent: { 
              type: Type.STRING, 
              description: "分析哪个时间单元效率最高，其背后暗示着什么样的生理节律与深层动力，约80字" 
            },
            actionTitle: { 
              type: Type.STRING, 
              description: "临床提升指引标题" 
            },
            actionPoints: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "提供3个极致具体、行之有效的行为指令（包含操作步骤与原理，如『晨间静荷载过滤』）" 
            },
            metricsContext: { 
              type: Type.STRING, 
              description: "一段富有哲思的高级金句，关于时间主权，约40字" 
            }
          },
          required: ["patternTitle", "patternContent", "strengthTitle", "strengthContent", "actionTitle", "actionPoints", "metricsContext"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini AI");
    }

    const payload = JSON.parse(text.trim());
    return res.json({ success: true, isFallback: false, analysis: payload });

  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    // Graceful error fallback
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to generate AI analysis", 
      fallback: generateLocalFeedback(req.body.viewType, req.body.totalHours || 0, req.body.avgHours || 0, req.body.activeDays || 0, req.body.maxDayHours || 0, req.body.maxDayName || "--", req.body.dateRange || "")
    });
  }
});

// Helper: Generates beautiful rule-based local fallback diagnostics if key is missing or offline
function generateLocalFeedback(
  viewType: string,
  total: number,
  avg: number,
  activeDays: number,
  maxDay: number,
  maxDayName: string,
  range: string
) {
  if (total === 0) {
    return {
      patternTitle: "精力沉睡期",
      patternContent: "时间画布尚未录入任何专注印记。当第一个专注时间刻度被写入，本系统将即刻开启高精脑科学自律诊断。",
      strengthTitle: "静待第一缕曦光",
      strengthContent: "任何宏大的认知框架都始于一次精微的点击。请点击『登记今日专注』，打破时空死寂。",
      actionTitle: "先锋破冰指南",
      actionPoints: [
        "微习惯锚定：选择每日上午9:30，在课桌前静坐5分钟，即便什么也不做，也要完成开局仪式。",
        "物理断联隔离：在学习桌方圆1.5米内绝对清除手机与高刺激性事物。",
        "初荷设定：本期学时目标应以可控、温柔为度，不急于突破身体耐受度。"
      ],
      metricsContext: "“开始是行动的最大主权。” — 重塑第一步"
    };
  }

  const isWeekly = viewType === 'week';

  if (isWeekly) {
    if (avg >= 5) {
      return {
        patternTitle: "高功率过载流",
        patternContent: `您本周展现出极强的工业化产出秩序。总时长 ${total.toFixed(1)}h 且日均在 ${avg.toFixed(1)}h 以上，标准差极其稳定。但注意，高负荷运转对大脑前额叶皮层（PFC）消耗极大。`,
        strengthTitle: `峰值巅峰：${maxDayName}高能日`,
        strengthContent: `在 ${maxDayName} 您完成了 ${maxDay.toFixed(1)}h 的单日突破。这代表强烈的自发动力或外部高压激发，暗示此周期是您的效率红区。`,
        actionTitle: "主动防崩塌减压指引",
        actionPoints: [
          "前额叶蓄水控制：建议下个周期首日主动削减20%任务强度，在专注间隔插入3-5分钟非屏极简冥想。",
          "多巴胺超量代偿规避：防止完成阶段性任务后的报复性熬夜，用热温水浴替代虚拟网络高刺激反馈。",
          "番茄能量呼吸：贯彻45分钟深度学习+10分钟纯白休息，不恋战，保护敏锐度。"
        ],
        metricsContext: "“张弛无虞，深邃长青。节制是高级精力的最大赞美。”"
      };
    } else if (activeDays >= 5) {
      return {
        patternTitle: "微自律复利网络",
        patternContent: `本期虽然单次专注于 ${avg.toFixed(1)}h 左右，但打卡频率呈现高度粘性（${activeDays}天），属于极健康的微习惯复利网。这种润物无声的行为模式具有最久的自愈生命力。`,
        strengthTitle: `高频稳态锚定`,
        strengthContent: `${maxDayName} 属于效率轻微峰值（${maxDay.toFixed(1)}h），但您的行为模式核心在于横向的习惯保持。每日在同一时间段进入脑部微升温极佳。`,
        actionTitle: "深度冲刺破局指引",
        actionPoints: [
          "渐进超负荷练习：在下周挑选一天作为『深度心流日』，挑战将该日的专注时长递增1.5小时。",
          "脑皮层热身仪式：在心流日前10分钟，手写出三个核心痛点，帮助大脑提前过滤杂讯。",
          "强化学习意义阀门：在床头醒目位置放一页您最希望攻克的难题架构，维持底层意识兴奋。"
        ],
        metricsContext: "“水滴穿石并非力大，而是不舍昼夜的恒心。”"
      };
    } else {
      return {
        patternTitle: "脉冲式游离专注",
        patternContent: `本周时间分布波动较大，学习活动高度集中在以 ${maxDayName} (投入 ${maxDay.toFixed(1)}h) 为主的特定节点，其余时间经历漫长的静默期。属于典型脉冲型专注，容易陷入拖延与突击轮换期。`,
        strengthTitle: "单一脉冲火花",
        strengthContent: `虽然均线处于波谷，但单日突破 ${maxDay.toFixed(1)}h 表明您具有优秀的超强心流承载潜能，只是启动成本极高、习惯链断续。`,
        actionTitle: "行为启动阀降敏指令",
        actionPoints: [
          "2分钟断言指令：不要说『我要学3小时』，而是默念『我只整理笔记本2分钟』，击穿行动初始摩擦力。",
          "习惯锁扣配置：将学习活动绑定在稳定的刚性生理习惯后。例如『晨跑完冲咖啡后，立即写5行代码』。",
          "物理视域锚定：让带有学习进度的屏幕或纸张在视野中自然裸露，作为被动的潜意识呼唤。"
        ],
        metricsContext: "“克服摩擦力最美妙的时刻，就是专注的起点。”"
      };
    }
  } else {
    // Month analysis fallbacks
    if (total >= 60) {
      return {
        patternTitle: "宏观长波丰收极",
        patternContent: `月累计时间高达 ${total.toFixed(1)}h，展现出绝对自律的时间宏观统筹。您的皮层已固化了稳定的深度认知自驱态，能够进行长周期复杂系统化技能的吞吐。`,
        strengthTitle: "微型高光聚合效应",
        strengthContent: `单月维持跨周高频自律，活跃天数高达 ${activeDays} 天。极值 ${maxDay.toFixed(1)}h 不突兀，暗合了内敛扎实的成长均线。`,
        actionTitle: "长期心流保温提纯",
        actionPoints: [
          "系统边界突破：将20%的时间分配于挑战超出能力安全区的高难度边界研究，防止舒适区枯竭。",
          "季度级别软退火：在月末留出完整48小时彻底去数字、去计划学习，完成前叶组织自然重组。",
          "反思矩阵升级：从单纯记录『时间长度』升格为记录『高维心流纯度得分』，持续提纯深度。"
        ],
        metricsContext: "“真正的优雅，是数月如一日的沉稳步伐。”"
      };
    } else {
      return {
        patternTitle: "长周期振荡重整",
        patternContent: `本月专注呈现中低频波动，累计 ${total.toFixed(1)}h 专注。月内打卡活跃度（${activeDays}天）呈阶梯式离散，属于多任务穿插或环境切换引起的时间重组期。`,
        strengthTitle: "离散高能断点",
        strengthContent: `即使总体稀疏，但在 ${maxDayName} 依然取得了 ${maxDay.toFixed(1)}h 的单日专注极质，说明深度工作的火种依旧炽热，仅需在结构上予以稳固。`,
        actionTitle: "微结构物理修复计划",
        actionPoints: [
          "时空结界设定：在卧房或书房辟出特定物理一角作为『深度自律结界』，进入此区禁止任何娱乐行为。",
          "月度打卡波峰平抑：把沉重的月度目标拆卸成极其温柔的『每周10小时』基准线，确保每周都有连续性。",
          "心流日历物理化：利用高亮笔在实体墙面日历记录，视觉化的连续色彩是抗击意志磨损的强效武器。"
        ],
        metricsContext: "“即使是微小的振荡，也是走向秩序的奏鸣。”"
      };
    }
  }
}

// 2. Vite Middleware Setup (Dynamic Development and Production serving)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lean Time Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
