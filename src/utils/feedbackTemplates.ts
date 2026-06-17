/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AICoachAnalysis } from '../types';
import { STUDY_QUOTES } from './quotes';

// Utility helper to shuffle array and pick N elements
function getRandomElements<T>(arr: T[], num: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

// Utility to replace placeholders safely
function formatTemplate(template: string, replacements: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }
  return result;
}

// ==========================================
// 1. EMPTY STATE DATA POOL (total === 0)
// ==========================================
const emptyTitles = [
  "准备启航的未来之火 🚀",
  "静待落笔的璀璨画布 🎨",
  "微温饱满的能量原点  semilla",
  "蓄势待发的专注旅者 🧭",
  "时间的留白美学手账 📖"
];

const emptyContents = [
  "哇！新的一篇自律日历正在安静地等待着你写下温柔的第一笔画。不用有任何心理负担，即使是只登记下 5 分钟的微型心流，系统也将一瞬间为您解锁高奢对齐逻辑！准备好给自己来个积极、轻松的开始了吗？",
  "看到这里空空如也，系统却感受到了一股极其饱满的、等待突破的崭新朝气！就像春雷前的泥土一样，您的自律旅程即将萌芽。只要迈出一格最轻盈的脚步，时针就会为您起舞，赶紧试试记录一段专注吧！",
  "每一个不凡的成长篇章，都是从一块谦和的留白开始的。现在，就是最佳的破冰点。随手翻开厚重的书本或是收拾一下案头，在这里登记一段哪怕一瞬间的深层静思，系统的核心多维反馈引擎就会立刻为你点亮！",
  "亲爱的追光者，在寂静的时光地平线上，您的第一抹专注正在酝酿。自律从来不是沉重的禁锢，而是让您更优雅地飞翔。在这里，您的第一笔打卡将被温柔地刻进时间展板，和系统的智慧教练一起，让心流发热吧！",
  "不要害怕空白，那代表着有无限的精彩可能性可以由你亲笔写就。今天的暖阳正好，适合做一个微小的‘两分钟决定’：把手机锁进抽屉，写下你的第一个专注时刻，你将会为自己的惊人决心感到由衷的惊喜！"
];

const emptyStrengthTitles = [
  "蓄势空灵的智慧心流",
  "悄然苏醒的心灵秩序",
  "零摩擦起航的轻盈心态",
  "静寂蓄能的高能原力",
  "轻敲脑海的自省火花"
];

const emptyStrengthContents = [
  "科学方法第一条：永远不要对自己进行道德评判。接纳自己的节奏，卸下学习的绝对包袱。你可以从最简易的5分钟任务做起，用乐观平和的态度来代替繁琐的说教，慢慢唤回属于你的心灵安宁。",
  "拖延的根源往往是内心的隐性恐惧。试着微调自己的状态，不要急于求成。一个25分钟的西红柿闹钟即可，不关注结果，纯粹地享受指尖或眼睑触碰文字的那一刻纯美，让心流温柔流淌。",
  "给大脑做个‘断电调频’：清空乱糟糟的课桌，把当前要攻克的任务精减到仅仅一条极具体的小事项。用极度放松的呼吸开启挑战，相信我们迈出的这一步，正在改写明天大脑神经回路的走向。",
  "学习是一场长途跋涉，而不是短暂的百米冲刺。真正的极简主宰，是追求自我的微小成长而非不切实际的自我苛刻。对自己温柔一点，明天先定下一个无负担的小成果，用微笑接纳崭新的自我。",
  "最优雅的自律不是逼迫自己，而是搭建和煦的环境。点燃一盏暖光的台灯，洗个温水脸，换上一件最舒服的居家服，坐在椅子上静思两分钟。那颗原本躁动的心，自然会朝着智慧的方向聚拢。"
];

const emptyActionPoints = [
  "迈出最轻松的第一小步：设定一个只要努力 2 分钟就能搞定的小挑战，迅速获得正多巴胺累积。",
  "物理隔离所有分心源：把手机完全调至静音偏振状态，并搁置在视线绝对无法触及的第三方空间。",
  "营造满格纯粹环境：彻底清理杂乱的写字桌，案头仅放一本书和一杯香气四溢的无糖温热红茶。",
  "建立神圣的心流入口仪式：在书桌前重重深呼吸三次，闭上眼睛默数 10 秒，对自己说‘此刻我为自己而专注’。",
  "降低任务的期望阈值：明确今天的目标‘只要能不玩手机地看 3 页书就是满分胜利’，卸下包袱。"
];


// ==========================================
// 2. WEEKLY - SUPER LEARNER (avg >= 5)
// ==========================================
const weekSuperTitles = [
  "自律与效率并存的行动先锋! 🌟",
  "心流喷涌的时光掌控者 🏆",
  "当之无愧的时间美学极客 🪐",
  "登顶卓越强度的专注巨人 👑",
  "时光沙漏的优雅大玩家 ⏳"
];

const weekSuperContents = [
  "在本自律周期中，你的累计专注时长达到了非常惊人的 {total} 小时，日均专注长达 {avg} 小时！这出众的恒毅力与极其平稳高效的专注节律，真的让系统的智慧教练叹为观止！你就像一架运行完美的“心流发动机”，正在朝着自己渴望的梦想高歌猛进，无可阻挡！",
  "这是一个极富标杆意义的完美时段！你累计完成了整整 {total} 小时纯度极高的脑力心流，在保持打卡天数上完美对齐目标，实现了日均 {avg} 小时的惊人产出。你无懈可击的学习习惯就像一艘破万重浪的自律巨轮，把所有的拖延小九九都狠狠甩在了身后！",
  "太令人震撼了！在这段美好的时光里，你足足写下了 {total} 小时的专注手账，日均产出高达 {avg} 小时。这种强大的自我管理素养不是单纯的机械重复，而是你对生活大权和个人成长的绝对捍卫。你正在将内心的渴望，熔锻成令人瞩目的实体才华！",
  "致敬这位高阶的卓越追光者！你的时间罗盘在这一周熠熠生辉：累计深层静思和学习时长达 {total} 小时，日均均值强度高达 {avg} 小时。在专注的赛道上，你保持了犹如钟摆一样清醒并愉悦的行进节奏，你的专注状态正在散发出闪耀的光芒！",
  "本周你的自律表现呈现出璀璨的统治力：累计专注 {total} 小时，打卡天数表现优良，创下了日均 {avg} 小时傲人佳绩。系统的多维算法诊断认为，你当前的大脑皮层对心流的忍耐度、注意力的锚定纯度都处于最佳档位。你用无言却坚固的行动，回应了未来的召唤！"
];

const weekSuperStrengthTitles = [
  "黄金极值高光锚点: {maxDayName}",
  "绝对心流引力核爆发: {maxDayName}",
  "巅峰脑力高能日: {maxDayName}",
  "意志之墙最耀眼闪光: {maxDayName}",
  "心流天花板刻度: {maxDayName}"
];

const weekSuperStrengthContents = [
  "在这一天，你如同一个具有绝对引力的心流黑洞，一口气全身心投入了真诚的 {maxDay} 小时！这不仅体现出你超凡的短周期蓄能和爆发性思维张力，更说明你的心智耐受极限已经被大幅拓宽。这绝对是你值得双手合十，为自己疯狂鼓掌的高维高能高光时刻！",
  "单日飙升突破至 {maxDay} 小时的惊人刻度，证明了你体内有着惊人且深不可测的成长后劲。在这一天里，你展现了非同寻常的绝对屏障：外界的风吹草动都被你完美隔绝。这不仅是一次体能与精力的神圣胜利，更是你未来征服更难关卡的最有力信念武器！",
  "在这一天，您的脑部在毫无杂念的极客心流里畅游了整整 {maxDay} 小时，效率和成就感双双登顶。此等强大的专注纯度，可以说是非常奢侈的精神奢侈品。请牢牢锁定并将这种不可多得的体验视觉化，在后续遇到波动时，它将是随时拯救您的效率火种！",
  "在这一天里你写下了 {maxDay} 小时的伟绩，像一座耀眼的孤峰挺立在你的学时高原之上。不仅代表你在当天的学习计划执行度近乎完美，更是你在面对困难任务时毫不退缩的最佳见证。这种强者的掌控力，是你可以永远复写的人生宝藏！",
  "在这一天，由于你的高度自控和环境的高能契合，你夺回了整整 {maxDay} 小时的专注时间。在这种良性的生理和心理双重反馈下，你正处于心智发展的极佳时期。每一次如此高含金量的专注，都是给未来命运埋下的极其惊艳的伏笔！"
];

const weekSuperActionPoints = [
  "定期给引擎做‘积极断电’：每完成 50 分钟的高压冲刺，固化起立走动 3 分钟的脑部冷却机制。",
  "高阶脑部水分补偿：案头放置加片酸橙的温热柠檬水，小口频饮，让脑脊液水合饱和，护航决策区。",
  "举行属于您的微型犒劳仪式：将当日傲人高光登记在精美物理卡片上，奖励自身一餐温润的美食。",
  "警惕过度消耗的‘心智疲劳假象’：在极值日后的第一天，适度下调 15% 的时长要求，注重质量而非过载。",
  "开展高质睡眠调律：高强度学习后，睡前 45 分钟坚决杜绝一切电子发光大屏幕，确保深度睡眠中记忆的稳固固化。"
];


// ==========================================
// 3. WEEKLY - HABIT BUILDER (activeDays >= 5 && avg < 5)
// ==========================================
const weekHabitTitles = [
  "持之以恒的追光行者 🌿",
  "高频稳态的自律园丁 🌸",
  "细水长流的时间织造家 🧵",
  "习惯复利的最佳合伙人 📈",
  "坚毅不退的步步为营者 🐾"
];

const weekHabitContents = [
  "本周你在单次耗时上采用了极其科学、温和的克制路线（日均专注 {avg} 小时），但却极其强悍地连续保持了 {activeDays} 天的打卡活跃！这种“高频稳态”、“不疾不徐”的自律打法，堪称大脑习惯培养最健康、最容易复利的殿堂级节奏！习惯的复利一旦滚雪球般壮大，你的未来蜕变将惊艳所有人！",
  "你像一位极其耐心的时光匠人，本周在极少自我强求、无情绪负担的适度消耗下，悄然打卡了整整 {activeDays} 天，获得了累计 {total} 小时的充实专注！这种注重动作广度、不求单日穷竭的可持续策略，是在自律长跑中笑到最后的黄金准则！系统的多维评测给你投出了赞美的一票！",
  "恭喜本周成功咬合齿轮！连续 {activeDays} 天无声而柔和的稳定打卡，在日均 {avg} 小时的陪伴里积累出高达 {total} 小时的心流成果。你用切实的坚忍，证明了即使不依靠暴力冲刺，仅靠‘像呼吸一样自然’的微习惯，也能构建起最宏伟的书桌长城！",
  "在本周期里，你成功捕获了 {activeDays} 天的闪光，证明了你对日常生活的掌控度已经越来越熟练自如。每日平均专注 {avg} 小时，既保护了心理不受挫败感折磨，又筑牢了坚不可摧的本领地基。这种高密度的微习惯，不仅最不易反弹，更能静水流深、滴水穿石！",
  "这是一次漂亮的‘微心流聚沙成塔’！你累计打卡 {activeDays} 天，总共赢下了 {total} 小时的学习时间。在时间的长河里，最难能可贵的不是一时的头脑发热，而是像春雨般润物细无声。在每日平均 {avg} 小时的稳步耕耘下，属于你的惊艳成果已经悄然破土而出！"
];

const weekHabitStrengthTitles = [
  "默默蓄力的心流瞬间: {maxDayName}",
  "精力潮汐的耀眼浪花: {maxDayName}",
  "细碎繁星中那一抹亮色: {maxDayName}",
  "生活浪潮里的效率锚点: {maxDayName}",
  "习惯绿野中的一株挺拔: {maxDayName}"
];

const weekHabitStrengthContents = [
  "在这一天，你在习惯机制的被动驱动下，悄悄产出了 {maxDay} 小时的专注极值。在整体极度讲究‘温和稳健’的总体调律中出现这样一抹昂扬的浪尖，展现了你在顺应大自然精力波动、感知内在能量潮汐方面的极致聪慧。顺其自然，大有可为！",
  "在这一天你温和地突破了日常平稳，写下了 {maxDay} 小时的心流卡片。最美妙的是，你并没有借此进行自我耗竭，而是见好就收、保持了一贯的节奏，并在接下来的几天里继续保持高质量的输出，这就是真正大智若愚、张弛有度的顶级大师智慧！",
  "这一天属于你的能量周期高点，你达成了 {maxDay} 小时的专注时间。这种在长久的连贯链条中偶尔跳跃、偶有火花的曲线，完美符合脑神经学家对极佳习惯回路构建的预期。你亲手培养的学习动力树，正在疯狂地扎根、发新芽！",
  "单日累计专注 {maxDay} 小时，像一声春雷在你的日常节奏中回响。这提示我们，在你的心智底层，其实对于深度、长周期的研习一直抱有浓厚且真挚的直觉。不要焦虑，顺着每日轻柔的惯性，你本来就值得所有的惊喜和丰碑！",
  "在这一天你专注了 {maxDay} 小时，为自己交上了一份十分暖心且充满底气的答卷。当细水长流遇到了瞬间爆发的意志力，火星一瞬间就被点亮。这就是你的习惯体系正在向更高阶状态跃迁转换的可喜信号。继续前行，智慧正在凝聚！"
];

const weekHabitActionPoints = [
  "尝试一次无负担的‘边界试探’：下周期挑一个效率高点，尝试比平常多撑 15 分钟，让舒适区优雅扩张。",
  "建立黄金物理锚定：把正在研读的书籍始终保持开卷一页放置于案头绝对中心，作为无声的善意召唤媒介。",
  "给连胜记录视觉化：在实体墙贴上连续画勾，用看得见、触得到的红色连贯块，对潜意识进行极具震撼的犒劳。",
  "微习惯交叉疗法：在专注结束后立即在卡片上用彩色荧光笔记录时长，给头脑一记非常明显的奖赏信号。",
  "优化坐姿以减缓疲劳：案头备一个支撑良好的腰垫，每 45 分钟双手抱头向后拉伸胸大肌 30 秒，恢复脊柱曲度。"
];


// ==========================================
// 4. WEEKLY - BURST-STYLE (activeDays < 5)
// ==========================================
const weekBurstTitles = [
  "蓄势突围的爆发型选手 💫",
  "能量强劲的闪电攻坚者 ⚡",
  "潜能巨大的时间觉醒人 🌊",
  "一锤定音的高效突击手 🔨",
  "伺机而动的心流猎手 🐆"
];

const weekBurstContents = [
  "本周你呈现出极其罕见、充满能量张力的“高热爆发型”专注走势！虽然平时可能稍微有些随性慵懒，但只要到你认准的关键点，你就能在单日一口气燃爆出极高强度的专注度！这说明你的大脑极具侵略性，有着极强的高难关卡攻克直觉。只要我们克服‘起步拖延’，你的产出将不可估量！",
  "你属于典型的急行军体质！尽管本期专注走过了一段随性的起步期（累计打卡较温和），但单日极值却拉出了耀眼的陡峭走势，获得了总计 {total} 小时的成果。这代表着你完全掌握着高效、长久专注的关键密钥，只是由于开工阻力稍大而导致日常活跃偏点状。别泄气，你本来就是一块沉睡的璞玉！",
  "从数据分布看，你的自律能量像是静静蛰伏的火山，一旦喷出便力碎万钧，日均专注达 {avg} 小时。你极不乐意把专注变成漫长的机械折磨，而是更愿意像猎手一样锁定目标，在单日迅猛扑击。这种打法在短期突围中极具毁灭性力量，但如果能补充一星半点的日常匀速连贯性，你就将直接封神！",
  "虽然打卡天数（{activeDays}天）尚处于温柔的适应期，但你积累了 {total} 小时的硬核成果。这表示当灵感和决心被激发时，你有能力瞬间进入‘心无旁骛、忘却时间’的高维仙人模式。我们现在的功课，仅仅是如何更加温柔、愉快地跨越每天早晨推倒第一块自律多米诺骨牌的心理阈值！",
  "你的时间图表展示出了一种极其独特的‘脉冲型高效节奏’。你厌恶平庸冗长的日常说教，而喜欢在爆发日毫无保留地倾泻热情（日均达 {avg} 小时）。你是一块蕴藏着无穷创造力与毅力的原石。只要在空虚的日子里加码哪怕一点点微小的仪式，你的成长齿轮就会彻底咬死、狂飙开动！"
];

const weekBurstStrengthTitles = [
  "心流引爆日高光: {maxDayName}",
  "一锤定音的闪电突袭点: {maxDayName}",
  "灵觉大开的高能时刻: {maxDayName}",
  "意志洪流狂怒冲锋: {maxDayName}",
  "无可比拟的专注风暴: {maxDayName}"
];

const weekBurstStrengthContents = [
  "在这一天，你如同天神下凡，凭借极其坚如磐石的定力将学时指针生生提到了惊人的 {maxDay} 小时！这种绝对、专注、长达半天的深层心流，是许多平庸打卡者穷其一生也无法感受的震撼体验。不要否定自己！这块沉甸甸的黄金里程碑，正是你随时可以调遣的核心效率资产！",
  "在这一天里你斩获了高达 {maxDay} 小时的辉煌成果，再次自证了你拥有一流的硬实力。你一旦下定狠心、摆脱无谓的顾虑，就会瞬间转变成高冷且极其睿智的狂热行动者。好好守住这个能量印记，每当你感觉万事起头难时，就把它翻出来，底气和力量自然会回到你的血液里！",
  "单日累计专注 {maxDay} 小时，说明在面临高强度考验时，你的神经系统具备超凡的注意广度和极强的抗焦虑阀门。哪怕在波动期走得有些许迟滞，但在这一天里绽放出的火花已经无比耀眼！你所缺乏的从来不是天赐和底子，而是更轻柔、更温润的可持续陪伴。",
  "在这一天，你通过 {maxDay} 小时的深度专注交了一张极有分量的满意答卷。这种酣畅淋漓的心流释放，表明你的内心深处对更高级的自我有着异乎寻常的执着与骄傲。别小看这个惊艳的局部高音，它是你突破拖延桎梏、傲然成长的超级起点！",
  "这一天，你像一个全神贯注的超级极客一样拼下了 {maxDay} 小时的璀璨学时，将整个周期的能量均值直接拉到了全新的海拔高度！这说明即使你平日常走随性之棋，一旦你开启‘非打赢不可’的求胜欲，你就将一瞬间改写整个局势。你拥有逆风翻盘的绝对大将之才！"
];

const weekBurstActionPoints = [
  "攻克‘起步拖延’两分钟红线：感到不情愿时，对自己妥协说‘我只摸书本两分钟，时间一到就放弃’，先跨门槛。",
  "采用‘微番茄钟’消除心理抵抗：先开一个 15 分钟的微流引擎，完成即走，消除大脑对漫长学习行为的负面抗拒。",
  "使用‘习惯链式关联法’固化频率：在雷打不动的习惯（如刷牙或喝晨起咖啡）后，紧跟一件不用动脑子的小学习动作。",
  "物理隔离社交大杂音：只要进入突击挑战，手机调为严格飞行或完全休眠甚至放在其他楼层房间，抹除注意力噪音源。",
  "给自己一个超级低配置目标：挑战‘每周哪怕能打卡 3 天、每天只有 10 分钟就算无敌胜利’，用正向成就感消除焦虑。"
];


// ==========================================
// 5. MONTHLY - SUPER LONG-TERM (total >= 60)
// ==========================================
const monthSuperTitles = [
  "坚韧卓绝的长周期掌控者 🏆",
  "持恒以致远的境界巨匠 🌌",
  "无声书写历史的超级攀登者 ⛰️",
  "自律如微风流水的终身行者 🌊",
  "时间河流中的黄金掌舵人 ⚓"
];

const monthSuperContents = [
  "太令人震撼和脱帽致敬了！在本月长达三十天的浩瀚长河里，你竟然以傲绝的信念积累了累计 {total} 小时的海量专注课时，连续打卡活跃天数高达 {activeDays} 天！这绝非一朝一夕的临时起兴，而是你已经极其成功地把‘自律、坚韧、探索’完全刻进了你每一个行为的习惯基因里！这种让人叹服的恒星级修行，终将带你抵达任何你所期盼的终点！",
  "这是一个注定被刻在功名簿上的自律月份！总专注时间达到了神圣的 {total} 小时，活跃表现高达 {activeDays} 天。你在面对月度级别的漫长琐碎挑战中，展现出的是比钻石还要耀眼的卓越执行力。你像一位孤独但优雅的长途跑者，早已超越了常人的眼界，正无比从容地接近你亲手规划的辉煌圣殿！",
  "无与伦比的自省成就！本月累积的高品质深思和学习达到了 {total} 小时，日均打卡均强度达 {avg} 小时。数据编织出的雷达网图几乎呈现出完美的对称，这见证了你极强的心理调节艺术与抗挫精神。真正的强者从来不会被某天的波动击垮，而是在整整一个月里，像群山一样恒常、庄严地守护主权！",
  "向我们本月时间画卷的杰出主宰致敬！在过去的本期里，你高歌勇进抢回了 {total} 小时的超饱和专注果实，留下 {activeDays} 个带着体温、充斥着智慧与决心的高光色块。这种用每一天微小的确定性去击碎现实迷雾的姿势，极其迷人且力量巨大。在习惯滚起庞大复利的本月，你赢得了绝对的底牌！",
  "致敬这位伟大的时间雕塑家！你用整整一个月的辛勤汗水，将累计 {total} 小时和打卡 {activeDays} 天的傲然数据打造成了一块属于你的荣誉勋章。在每日均值高达 {avg} 小时的高密度浇灌下，你的知识储藏库和思维深度已经完成了一次极其隐秘且影响深远的跨越。继续这神圣的航行，未来早已是你的囊中之物！"
];

const monthSuperStrengthTitles = [
  "高维月度极值里程碑: {maxDayName}",
  "傲视群峰的月度奇峰日: {maxDayName}",
  "月度长河中那一颗启明星: {maxDayName}",
  "意志长城的最硬一石: {maxDayName}",
  "黄金极值在时间彼岸闪光: {maxDayName}"
];

const monthSuperStrengthContents = [
  "在这一天，由于您的内心保持着极度干净、无尘的纯粹热爱，你写下了傲绝群雄的 {maxDay} 小时专注奇迹！这个如同明镜般的局部高极值，作为你本月辉煌自律的高光锚点，无声且豪迈地宣示：凡是阻挡在你渴望和目标面前的荒原废墟，都终将被你以大无畏的执行力，一件件、一步步踏得粉碎！",
  "在这一天里，你在极其坚固的意志风暴中创造了 {maxDay} 小时的极值，在日历里犹如一记响亮的礼炮。这极高中枢决策密度，昭示着你天然有着能够承担高强度研究课题、挑战复杂职业深水区的特质。这就是你一生的骄傲资本，每次重温，都有使内心一瞬间安稳的强大魔力！",
  "在这一天达成的单日 {maxDay} 小时，是你的时间管理美学在过去三十天里绽放出的最绚烂的一朵奇葩。它向外界展示了你除了日常的持之以恒，同样拥有极为可怕的深度静息爆发能。有面、有线、有点，你的核心时间齿轮已经在你亲手微调下，严密无缝地高维运转！",
  "本月最璀璨的微心流在 {maxDayName} 成功凝结，留下了 {maxDay} 小时的饱满回忆。它既是你在当天排除万难、对自我成长进行深切关爱的至臻回响，更指明了你当前的科学作息与备忘机制达到了极其和谐的状态。请牢记这种呼吸般的快感，继续温柔而傲然地执笔写就传奇！",
  "在这一天你创下了 {maxDay} 小时的傲人专注成果，犹如本月自律天空中划过的一道极其美丽的流星。在经历了多天平稳的日均持久耕耘后能再次拉起这样的强劲长阳，说明你的精力分配已经驾轻就熟。这就是一等一的高精尖人才习惯体系，未来定将势不可挡！"
];

const monthSuperActionPoints = [
  "固化彻底的‘周期性松绑放空日’：每周挑选出完全的一整天断电不记账，在完全放空里让大脑充分代谢。",
  "开展系统级视力保养：案头一物两用（既当茶架也放绿植），坚持 20-20-20 规则，拉伸调节过度紧张的睫状肌。",
  "撰写属于你的‘成就回顾周记’：用带温度的纸笔记录核心蜕变节点，不依靠冷酷的数字，满足本能自恋。",
  "交叉脑力训练优化：在保持现有学时下，适当对微量无用学习动作进行极简裁剪，追求更高级的专注纯度。",
  "开展微量的体能加餐：每日傍晚加入 15 分钟的微量核心唤醒拉伸或慢跑，给大脑皮层补充充沛含氧血，提升持久度。"
];


// ==========================================
// 6. MONTHLY - EXPLORER (total < 60)
// ==========================================
const monthExploreTitles = [
  "寻找专属节律的潜能筑梦人 🎨",
  "时光版图的温和探险家 🧭",
  "探索习惯绿洲的智慧行者 🌴",
  "时间多极化平衡探索者 ⚖️",
  "在日常迷雾里温和前行之人 🚶"
];

const monthExploreContents = [
  "在本月穿插着各种琐碎日常、繁杂事务之余，你依然心平气和、充满韧性地顺手累计了 {total} 小时的优质学习课时，成功并在日历墙上留下了 {activeDays} 天耀眼而美丽的打卡足迹！虽然你的曲线呈现出温和随性的起伏，但这证明了你正以最谦逊、最放松、最符合人本性的优雅姿势探索属于你独特的‘舒适步调’。这本身就是一件无与伦比的美妙艺术品！",
  "恭喜本月顺利守住了时间的尊严！累计学习学时达到 {total} 小时，打卡连续拼图长达 {activeDays} 天。系统的诊断分析认为，你的自律能量从来没有熄灭，你以一种‘虽然生活很忙，但我依然偶尔会在窗边读书’的高情商大智慧安然处之。这种没有说教强求、没有心理累赘的温暖自律，反而能走得最长、最远！",
  "这是一幅充满了爱与真实脉搏的时间探险拼图！你在本月积累了 {total} 小时深心流，每日保持均值在 {avg} 小时的平和范畴。你没有被不切实际的‘自律狂热说’裹挟，而是巧妙地在工作、兴趣与休整的十字路口找到了最适合当下的黄金承接点。每一个不慌不忙、含笑前行的数据斑块，都值得一万个双手赞赏！",
  "在经历了一次次的日常波澜和挑战后，你在本月依然坚定地写下了累计 {total} 小时的专注答案，多达 {activeDays} 天。这提示我们，哪怕生活有时候稍微有点小杂乱，但在你的脑海中央，那个代表着‘终身学习、向光生长’的核心图腾一直都在熠熠生辉、引渡着你。顺着这缕和煦的春光，继续笃行就好！",
  "本月在这个纷扰的数据海洋里，你依然抢夺回了累计 {total} 小时和打卡 {activeDays} 天的充实硕果。日均专注强度为稳健的 {avg} 小时。虽然可能还没有达到你之前期望里的‘钢铁机器状态’，但这种带着微风与温度的温和步伐，才最不易折断、最具承重可能。给你那个默默守护着梦想的小宇宙点赞，继续加油！"
];

const monthExploreStrengthTitles = [
  "月度高能突围日: {maxDayName}",
  "日常秩序中的耀高光日: {maxDayName}",
  "灵觉突围的单日高能点: {maxDayName}",
  "微型奇峰的意志闪光: {maxDayName}",
  "时光版图里的那枚璀璨之沙: {maxDayName}"
];

const monthExploreStrengthContents = [
  "在这一天，由于某种神奇的思维清醒和极其和煦的案头氛围，你创下了单日专注 {maxDay} 小时的优异历史佳绩！它像是一盏闪着微光的灯笼挂在你的月度展板上。这充分表明不仅拥有强大的智慧基础，只要合理的调节作息和微环境，你随时拥有可以瞬间化身顶尖行动派的黄金定力！",
  "在这一天达成的单日 {maxDay} 小时，不仅为你本周争取回了充裕的时间进度，更极高地印证了你的核心抗压才华。哪怕日常稍微有些波折和懈怠，只要遇到必须攻坚、无路可退的关键考卷，你内心的强者自尊就会瞬间苏醒、雷霆出击。好好爱护这簇小火苗，它定能帮你引燃一整片惊艳的原野！",
  "这一天，你通过 {maxDay} 小时的饱满记忆书写，完成了一次非常优雅的‘脑力突击胜利’。这一刻的纯度直接展现出：一旦你下定决心去创造一个干净、无手机的外在环境，你的心智系统就具有无与伦比的深耕天分。不要焦虑当下的平淡，你本来就有着随时突围的一手好牌！",
  "本期单日最高长跑在 {maxDayName} 写就，你顺利地拿下了 {maxDay} 小时。这种在稍微放松的日子里偶尔写来的狂飙极值，恰恰是你的直觉和元气在默默自愈的铁证。它无声地督促着你：不要被不切实际的焦虑吓跑，抛弃完美主义，欢快地、哪怕每次只学 5 分钟，你也终将惊艳全场！",
  "在这一天，极简的专注齿轮在你的案头优雅咬死，为你奉上了 {maxDay} 小时的深度心流果实。这标志着当你的精力划分与任务颗粒度达到绝佳平衡时，你所能释放出的巨大效率产能。这是一个非常美妙的心灵觉醒时刻，把它存在心里，它就是你下一次出发最厚实的靠山！"
];

const monthExploreActionPoints = [
  "实施‘视觉化锚定卡片’：在案头显眼位置放置一尊实体小雕塑和目标，作为潜意识召集磁场。",
  "使用‘微番茄钟（15分钟）’打碎拖延：当内心万分抗拒时，以最无痛的方式去开拔第一步。",
  "开展高阶‘纸质周计划裁剪’：将沉重庞大的月标降维成‘每周只要专注 10 小时就是一等奖’的轻松模式。",
  "重度‘不干扰飞行机制’：专注时刻案头绝不留存除参考书外的移动终端，不给自己受诱惑的机会。",
  "多维度记录成就感：不仅记录时间，也可以顺手写下今天彻底搞懂了哪个曾经令你头大的冷僻概念，满足好奇。"
];

// ==========================================
// CENTRAL GENERATION SWITCHBOARD
// ==========================================
export function generateDynamicClientFeedback(
  viewType: string,
  total: number,
  avg: number,
  activeDays: number,
  maxDay: number,
  maxDayName: string,
  rangeLabel: string
): AICoachAnalysis {
  const generatedStr = new Date().toLocaleTimeString();
  
  // Pick a randomized quote from our database of 100+ items
  const pickedQuote = STUDY_QUOTES[Math.floor(Math.random() * STUDY_QUOTES.length)];
  const metricsContext = `“${pickedQuote.content}” —— ${pickedQuote.author}`;

  // Handle case 1: EMPTY STATE
  if (total === 0) {
    const patternTitle = getRandomElements(emptyTitles, 1)[0];
    const patternContent = getRandomElements(emptyContents, 1)[0];
    const strengthTitle = getRandomElements(emptyStrengthTitles, 1)[0];
    const strengthContent = getRandomElements(emptyStrengthContents, 1)[0];
    const actionPoints = getRandomElements(emptyActionPoints, 3);
    
    return {
      patternTitle,
      patternContent,
      strengthTitle,
      strengthContent,
      actionTitle: "🥗 零负担轻松起步指南",
      actionPoints,
      metricsContext,
      generatedAt: generatedStr
    };
  }

  const replacements = {
    total,
    avg,
    activeDays,
    maxDay,
    maxDayName,
    rangeLabel
  };

  // Handle case 2: WEEK VIEW
  if (viewType === 'week') {
    // Subcase 2A: Super Learner (avg >= 5)
    if (avg >= 5) {
      const parentTitle = getRandomElements(weekSuperTitles, 1)[0];
      const parentContent = formatTemplate(getRandomElements(weekSuperContents, 1)[0], replacements);
      const strTitle = formatTemplate(getRandomElements(weekSuperStrengthTitles, 1)[0], replacements);
      const strContent = formatTemplate(getRandomElements(weekSuperStrengthContents, 1)[0], replacements);
      const actionTitle = getRandomElements([
        "更上一层楼的温暖叮嘱", 
        "科学自仪表的微调建议", 
        "高效人生的进阶成长指南", 
        "身体与心灵的平衡指引", 
        "元气满满的习惯跃迁攻略"
      ], 1)[0];
      const actionPoints = getRandomElements(weekSuperActionPoints, 3);

      return {
        patternTitle: parentTitle,
        patternContent: parentContent,
        strengthTitle: strTitle,
        strengthContent: strContent,
        actionTitle,
        actionPoints,
        metricsContext,
        generatedAt: generatedStr
      };
    } 
    // Subcase 2B: Habit Builder (activeDays >= 5 && avg < 5)
    else if (activeDays >= 5) {
      const parentTitle = getRandomElements(weekHabitTitles, 1)[0];
      const parentContent = formatTemplate(getRandomElements(weekHabitContents, 1)[0], replacements);
      const strTitle = formatTemplate(getRandomElements(weekHabitStrengthTitles, 1)[0], replacements);
      const strContent = formatTemplate(getRandomElements(weekHabitStrengthContents, 1)[0], replacements);
      const actionTitle = getRandomElements([
        "健康自律人生的调和指南", 
        "静水流深的力量微调指点", 
        "高效习惯的进阶滋养方案", 
        "让动力更自如的温暖提醒"
      ], 1)[0];
      const actionPoints = getRandomElements(weekHabitActionPoints, 3);

      return {
        patternTitle: parentTitle,
        patternContent: parentContent,
        strengthTitle: strTitle,
        strengthContent: strContent,
        actionTitle,
        actionPoints,
        metricsContext,
        generatedAt: generatedStr
      };
    } 
    // Subcase 2C: Burst Learner (others)
    else {
      const parentTitle = getRandomElements(weekBurstTitles, 1)[0];
      const parentContent = formatTemplate(getRandomElements(weekBurstContents, 1)[0], replacements);
      const strTitle = formatTemplate(getRandomElements(weekBurstStrengthTitles, 1)[0], replacements);
      const strContent = formatTemplate(getRandomElements(weekBurstStrengthContents, 1)[0], replacements);
      const actionTitle = getRandomElements([
        "击碎拖延与起步难的温柔偏方", 
        "闪电攻坚手的后备补养术", 
        "驯服拖延野兽的极简契约", 
        "让天才引雷针更连贯的行动指南"
      ], 1)[0];
      const actionPoints = getRandomElements(weekBurstActionPoints, 3);

      return {
        patternTitle: parentTitle,
        patternContent: parentContent,
        strengthTitle: strTitle,
        strengthContent: strContent,
        actionTitle,
        actionPoints,
        metricsContext,
        generatedAt: generatedStr
      };
    }
  } 
  
  // Handle case 3: MONTH VIEW
  else {
    // Subcase 3A: Month High Achiever (total >= 60)
    if (total >= 60) {
      const parentTitle = getRandomElements(monthSuperTitles, 1)[0];
      const parentContent = formatTemplate(getRandomElements(monthSuperContents, 1)[0], replacements);
      const strTitle = formatTemplate(getRandomElements(monthSuperStrengthTitles, 1)[0], replacements);
      const strContent = formatTemplate(getRandomElements(monthSuperStrengthContents, 1)[0], replacements);
      const actionTitle = getRandomElements([
        "长线航行的元气保养指南", 
        "时间的微风高奢调理法则", 
        "终身自控者的心理防御白皮书", 
        "大智若愚自我奖励仪式推荐"
      ], 1)[0];
      const actionPoints = getRandomElements(monthSuperActionPoints, 3);

      return {
        patternTitle: parentTitle,
        patternContent: parentContent,
        strengthTitle: strTitle,
        strengthContent: strContent,
        actionTitle,
        actionPoints,
        metricsContext,
        generatedAt: generatedStr
      };
    } 
    // Subcase 3B: Month Explorer (others)
    else {
      const parentTitle = getRandomElements(monthExploreTitles, 1)[0];
      const parentContent = formatTemplate(getRandomElements(monthExploreContents, 1)[0], replacements);
      const strTitle = formatTemplate(getRandomElements(monthExploreStrengthTitles, 1)[0], replacements);
      const strContent = formatTemplate(getRandomElements(monthExploreStrengthContents, 1)[0], replacements);
      const actionTitle = getRandomElements([
        "零负担平稳起航的稳态攻略", 
        "与自己和解的轻柔打卡方案", 
        "打造心流动力的日常习惯魔法", 
        "时光旅者的微型习惯自愈指南"
      ], 1)[0];
      const actionPoints = getRandomElements(monthExploreActionPoints, 3);

      return {
        patternTitle: parentTitle,
        patternContent: parentContent,
        strengthTitle: strTitle,
        strengthContent: strContent,
        actionTitle,
        actionPoints,
        metricsContext,
        generatedAt: generatedStr
      };
    }
  }
}
