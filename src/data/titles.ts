import type { Tag } from '../engine/types';

/** Placeholder pools — `{key}` in a template is replaced by a random entry. */
export const TITLE_POOLS: Record<string, string[]> = {
  cat: ['我家猫', '楼下橘猫', '一只流浪猫', '猫主子', '隔壁的布偶', '小区的黑猫', '我家胖橘', '室友的猫'],
  catAct: [
    '学会了开冰箱', '把我的键盘当成了床', '半夜在客厅开演唱会', '偷吃了我的外卖', '离家出走三天又回来了',
    '学会了冲马桶', '在镜头前装死', '把快递盒当成了别墅', '对着空气打了一套拳',
  ],
  ai: ['AI', '大模型', 'AI 数字人', '一个开源模型', 'AI 助手', '我的赛博分身', '公司新来的 AI'],
  aiAct: [
    '替我写完了年终总结', '开始反向教我做人', '一本正经地胡说八道', '学会了阴阳怪气', '画出了我的前任',
    '抢走了老板的饭碗', '给自己写了一份辞职信', '说它也想放假',
  ],
  money: ['副业', '月入三万', '躺赚', '第一桶金', '存款', '年终奖', '摆摊', '理财'],
  moneyAct: [
    '摆摊一天赚了{big}', '存下了人生第一个{big}', '被理财课割了韭菜', '靠捡瓶子实现了财富自由',
    '把工资条发到了家族群', '一天打三份工', '用 50 块钱活了一个月',
  ],
  fun: ['笑不活了', '太抽象了', '整活', '鬼畜', '名场面', '离谱', '笑到邻居报警'],
  drama: ['吵翻了', '撕起来了', '翻车了', '争议不断', '连夜道歉', '评论区沦陷', '吵了三千楼'],
  hot: ['热搜', '刚刚', '突发', '官宣', '全网', '今日头条', '爆了'],
  who: ['普通人', '打工人', '00 后', '大学生', '我妈', '我二舅', '隔壁老王', '实习生', '中年人'],
  time: ['三天', '一周', '凌晨三点', '一个月', '24 小时', '下班后', '五分钟'],
  big: ['三万', '十万', '一个亿', '五百块', '两千八', '一百万'],
  n: ['3', '5', '7', '9', '10', '99'],
  ep: ['2', '7', '13', '38', '108', '520'],
  shock: ['震惊！', '紧急！', '离谱！', '绝了！', '救命！', '注意！'],
};

export const TITLE_PREFIXES = ['【建议收藏】', '【全网首发】', '【独家】', '【爆】', '【必看】', '【干货】'];
export const TITLE_SUFFIXES = [
  '（附教程）', '｜结局意想不到', '｜第 {ep} 集', '（真实经历）', '，看到最后我哭了', '｜建议反复观看',
  '（已三连）', '｜评论区见', '，速看！', '（不看后悔）',
];

/** Templates keyed by combo id. `{card}` = name of a played card. */
export const COMBO_TITLES: Record<string, string[]> = {
  vlog: ['我的日常：{card}', '随手拍：{card}', '今天也是平平无奇的一天', '{who}的 {time}：{card}'],
  pair: ['{card}，但是看两遍', '一个视频讲透「{card}」', '关于{card}，我说两句'],
  two_pair: ['{card}和它的另一面', '双倍快乐：{card}', '一口气看完两个大瓜'],
  three: ['我坚持拍了{time}的{card}', '{card}，一个系列看懂', '全网最全「{card}」合集'],
  full_house: ['{card}的一百种打开方式', '从{card}说起，一口气讲完', '{card}完整版来了'],
  four: ['这个赛道我承包了：{card}', '{card}账号做到第{ep}期，我悟了', '只拍{card}，我涨粉了'],
  five: ['纯享版：{card}', '{card}浓度 100%，不掺水', '全程高能：{card}纯享'],
  mixed4: ['{shock}一个视频塞了四个热梗', '什么都有一点：{card}', '{who}看了沉默，{who}看了流泪'],
  rainbow: ['{shock}这条视频全网通吃', '一条视频，五个热搜', '{hot}！男女老少都在看的视频'],
  cute_fun: ['笑不活了！{cat}{catAct}', '{cat}{catAct}，我笑到打鸣', '{shock}{cat}竟然{catAct}', '{fun}：{cat}的迷惑行为大赏'],
  ai_money: [
    '普通人不知道的 {n} 个 AI 财富密码', '我用{ai}搞副业，{time}赚了{big}', '{ai}{aiAct}，然后我赚了{big}',
    '用 AI 赚钱的人，都在偷偷做这件事',
  ],
  money_drama: ['全网吵翻了：月入三万到底算不算穷？', '晒完工资条，评论区{drama}', '{who}该不该{money}？评论区{drama}', '{shock}{who}的{money}，被骂上了热搜'],
  ai_hot: ['{hot}！{ai}{aiAct}', '{hot}：又一个颠覆行业的大模型发布了', '{ai}{aiAct}，{hot}第一', '{shock}全网都在测的{ai}'],
  cat_ai: ['我让{ai}养了{time}的猫，发生了什么', '{ai}能听懂猫语吗？{cat}的回答亮了', '{cat}和{ai}吵了一架', 'AI 生成的猫，比我家猫还像猫'],
  fun_drama: ['{shock}吵架吵到对方笑出声', '这场辩论，评论区{drama}', '{fun}！{who}和{who}吵起来了', '最好笑的吵架名场面合集'],
  drama_hot: ['{hot}：{who}{drama}，瓜保熟', '{hot}瓜！评论区{drama}', '{shock}一夜之间{drama}', '吃瓜指南：{hot}背后的故事'],
  cat_hot: ['{hot}！{cat}{catAct}', '今天的{hot}，属于{cat}', '{cat}{catAct}，冲上{hot}', '{shock}{cat}成了顶流'],
  money_fun: ['穷得很有节目效果：{who}的{money}日记', '{who}{moneyAct}，{fun}', '{fun}！我的{money}全赔光了', '月薪三千的{who}，过出了月薪三万的感觉'],
  cat_startup: [
    '震惊！我家猫竟然学会用 AI 赚钱了', '{cat}当 CEO，{ai}打工，我负责数钱', '我用 AI 创业三天，{cat}成了合伙人',
    '猫咪 + AI = 月入{big}？亲测有效',
  ],
  melon: ['{hot}！史上最好笑的一场大瓜', '{shock}{who}{drama}，网友{fun}', '{hot}吃瓜，笑到肚子疼', '全网吵翻又笑翻：{card}'],
  pet_economy: ['{cat}带货一天卖了{big}', '{hot}同款猫粮，{cat}吃了都说好', '{shock}{cat}的广告费比我工资还高'],
  super_wealth: [
    '全网吵翻了：AI 真的能让普通人暴富吗？', '{hot}！{ai}{aiAct}，股市{drama}', '{shock}{who}用 AI 赚了{big}，评论区{drama}',
    '普通人最后的机会：AI + 热点 + 搞钱',
  ],
  fan_live: ['宠粉直播：老粉专属福利来了', '感谢{big}粉丝！今天全场送福利', '{who}粉丝见面会，现场失控了', '粉丝点单：{card}'],
};

/** Generic per-tag templates used for stack/mix combos to add variety. */
export const TAG_TITLES: Record<Tag, string[]> = {
  cat: ['{cat}{catAct}', '{shock}{cat}{catAct}', '{who}都在看的{cat}日常'],
  ai: ['{ai}{aiAct}', '{shock}{ai}{aiAct}', '{who}被{ai}卷到失业'],
  money: ['{who}{moneyAct}', '{shock}{who}{moneyAct}', '{money}的 {n} 个真相'],
  fun: ['{fun}：{who}的迷惑行为', '{shock}{who}整活{fun}', '{fun}，建议别在上班时看'],
  drama: ['{who}{drama}，你站哪边？', '{shock}{who}{drama}', '这件事，评论区{drama}'],
  hot: ['{hot}！{who}都在讨论', '{shock}{hot}来了', '{hot}：{card}'],
};
