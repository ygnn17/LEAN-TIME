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
    const { totalHours, avgHours, activeDays, maxDayHours, maxDayName, viewType, dateRange, recordsSlice, customConfig } = req.body;

    const reportPrompt = `
      根据用户的专注学习时长数据，进行一次通俗耐看、极其温暖且正面鼓励的进度剖析，并设计合理的、可轻松达成的激励型学习小建议：

      时间模式元数据:
      - 当前视角: ${viewType === 'week' ? '本周视图' : '本月视图'} (${dateRange})
      - 累计专注时长: ${totalHours} 小时
      - 活跃专注天数: ${activeDays} 天
      - 单日最高产出: ${maxDayHours} 小时 (出现在: ${maxDayName})
      - 均值强度: ${avgHours} 小时/日 (仅针对学习天数计算)
      - 时间轴数据: ${JSON.stringify(recordsSlice)}

      请遵守以下格式与要求:
      - 语气: 充满温度、像好朋友一般真诚、亲切温和且极具鼓励向。
      - 目的: 肯定用户的每一份微小努力，分析他们的专注优点，提供极好上手的简单日常小技能。
      - 细节: 绝对不要使用任何晦涩难懂的临床医学、脑科学名词或高深学术术语。多一些接地气的夸奖与关怀。
    `;

    const systemInstruction = "你是一位贴心温暖、擅长激励和肯定的身旁学习倾听者与日常成长教练。你通过用户的数据，用最亲切直白、热忱又有哲理的语言告诉对方他们哪里做得很好，并给予能够轻松落地、毫无压力的自律和生活建议。让用户看完后感到备受鼓舞、信心倍增，而不是觉得深奥复杂。请必须严格输出合法的 JSON 格式，键名需严格包含 patternTitle, patternContent, strengthTitle, strengthContent, actionTitle, actionPoints, metricsContext。";

    // Scenario A: Client configured custom model API keys (Gemini, DeepSeek, Zhipu or SiliconFlow)
    if (customConfig && customConfig.apiKey && customConfig.provider) {
      const { provider, apiKey, model } = customConfig;

      if (provider === "gemini") {
        const client = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: { 'User-Agent': 'aistudio-build-custom' }
          }
        });
        const chosenModel = model || "gemini-3.5-flash";

        const response = await client.models.generateContent({
          model: chosenModel,
          contents: reportPrompt,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                patternTitle: { type: Type.STRING },
                patternContent: { type: Type.STRING },
                strengthTitle: { type: Type.STRING },
                strengthContent: { type: Type.STRING },
                actionTitle: { type: Type.STRING },
                actionPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                metricsContext: { type: Type.STRING }
              },
              required: ["patternTitle", "patternContent", "strengthTitle", "strengthContent", "actionTitle", "actionPoints", "metricsContext"]
            }
          }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response from custom Gemini SDK call");
        const payload = JSON.parse(text.trim());
        return res.json({ success: true, isFallback: false, provider: "custom-gemini", analysis: payload });

      } else {
        // OpenAI-Compatible Providers (SiliconFlow, Zhipu, DeepSeek)
        let endpoint = "";
        let defaultModel = "";

        if (provider === "deepseek") {
          endpoint = "https://api.deepseek.com/chat/completions";
          defaultModel = "deepseek-chat";
        } else if (provider === "siliconflow") {
          endpoint = "https://api.siliconflow.cn/v1/chat/completions";
          defaultModel = "deepseek-ai/DeepSeek-V3";
        } else if (provider === "zhipu") {
          endpoint = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
          defaultModel = "glm-4-flash";
        } else {
          throw new Error(`Unsupported provider config: ${provider}`);
        }

        const chosenModel = model || defaultModel;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: chosenModel,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: reportPrompt }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Cloud LLM provider (${provider}) returned ${response.status}: ${errText}`);
        }

        const data: any = await response.json();
        const responseText = data.choices?.[0]?.message?.content;
        if (!responseText) {
          throw new Error("Empty chat content returned from provider");
        }

        let sanitized = responseText.trim();
        if (sanitized.startsWith("```")) {
          sanitized = sanitized.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }
        const payload = JSON.parse(sanitized);
        return res.json({ success: true, isFallback: false, provider: `custom-${provider}`, analysis: payload });
      }
    }

    // Scenario B: Backend Default/Fallback Gemini client (if server-side environment variables have key)
    const ai = getGeminiClient();

    if (!ai) {
      // Graceful fallback to rich local rule-based heuristic coach if API key not configured yet
      const fallbackAnalysis = generateLocalFeedback(viewType, totalHours, avgHours, activeDays, maxDayHours, maxDayName, dateRange);
      return res.json({ success: true, isFallback: true, analysis: fallbackAnalysis });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: reportPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patternTitle: { 
              type: Type.STRING, 
              description: "时间规律剖析标题，应该是简短、阳光、充满正能量的词语，如『持之以恒的追光者 🌟』" 
            },
            patternContent: { 
              type: Type.STRING, 
              description: "用知心大白话，分析当前专注的进步亮点与优秀品质，给予用户热烈的鼓励与暖心的肯定，约120字" 
            },
            strengthTitle: { 
              type: Type.STRING, 
              description: "专注闪光点标题，如『你专心致志的高光时刻 ✨』" 
            },
            strengthContent: { 
              type: Type.STRING, 
              description: "深挖效率最好的一天或某次坚持，给用户满满的感动和认可，约80字" 
            },
            actionTitle: { 
              type: Type.STRING, 
              description: "温暖实用的自律小技能指南标题" 
            },
            actionPoints: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "提供3个极致具体、行之有效且毫无心理负担的简单干货小妙招（比如桌子整理、2分钟启动魔法、小彩蛋奖励机制）" 
            },
            metricsContext: { 
              type: Type.STRING, 
              description: "一句能温暖人心、令人充满动力的日常成长治愈金句，约40字" 
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
      patternTitle: "准备启航的未来之火 🚀",
      patternContent: "哇！新的一篇自律日历正在等待你写下第一笔呢。只要随便记下一小段专注时刻，系统的专属分析就会为你点亮！准备好给自己来个正能量的开局了吗？",
      strengthTitle: "蓄势待发的心流",
      strengthContent: "每一次点击都是一个美好的开始。不用有心理负担，今天就先定一个小小的20分钟番茄钟试试看吧！",
      actionTitle: "温柔的新手建议",
      actionPoints: [
        "迈出第一小步：设定一个只要努力2分钟就能搞定的小任务，比如整理课桌或翻开书本第一页。",
        "物理隔离干扰：把手机调成静音并放到视线之外，这样能大幅减少想要拿起来的冲动哦。",
        "对自己微笑一下：专注是送给未来的最好礼物，无论多短都值得为自己感到骄傲！"
      ],
      metricsContext: "“种下一棵树最好的时间是十年前，其次是现在。加油，我们一起出发！”"
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
          "注重专注的纯度：如果有些倦怠，可以适当调低时长要求，高品质、无杂念 of 短心流同样是非常高级的打法。"
        ],
        metricsContext: "“在自律的道路上合拍奔跑时，也别忘了沿途美丽的风景。休息好才能走得更远哦！”"
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
        metricsContext: "“水滴穿石，最伟大的力量往往来自于每天不着痕迹的坚持。”"
      };
    } else {
      return {
        patternTitle: "蓄势突围的爆发型选手 💫",
        patternContent: `你属于典型的‘高能量爆发型’！虽然平时可能稍微有些随性，但一到关键时刻（比如 ${maxDayName}），你就能一口气爆发出 ${maxDay.toFixed(1)} 小时的超强战斗力！这代表你的内心深处有着巨大的爆发性心流潜能，只是平常启动成本略高、节奏有待匀称。`,
        strengthTitle: "惊艳的爆发高光点",
        strengthContent: `单日 ${maxDay.toFixed(1)} 小时的全力以赴，再次证明你具备惊人的高专注耐受。别小看这个火苗，它是你随时可以调动的底层心流能量配置！`,
        actionTitle: "击碎‘拖延与起步难’的物理小妙招",
        actionPoints: [
          "著名的两分钟黄金法则：感到万事起头难时，对自己说‘我就只学两分钟，完了立刻去玩’。一旦越过了开头，往往就能学下去！",
          "将学习和日常惯例锁死：在一项雷打不动的基础惯例后紧接专注。例如：‘洗漱完喝热水后，立刻在窗边安静看完5页书’。",
          "降低心理包袱：用无负担的小番茄钟（如15分钟）来替代沉重的高难度学习，消除潜意识里对专注行为的天然抗拒。"
        ],
        metricsContext: "“战胜拖延的秘诀，就在于放下完美主义，欢快地迈出那微不足道的第一步。”"
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
        metricsContext: "“真正的自律是一种生活常态，如微风、如流水，温顺而不可阻挡。”"
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
        metricsContext: "“不管步伐是大是小，只要你不停下脚步，就永远比昨天的自己更进一步。”"
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
