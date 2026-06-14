import type { DreamFragment, DreamRecipe } from '@/types'

export const FRAGMENT_POOL: DreamFragment[] = [
  { id: 'fc-1', type: 'character', name: '白衣剑客', description: '身负血海深仇的孤独剑客', sourceStoryId: 's1', emoji: '⚔️' },
  { id: 'fc-2', type: 'character', name: '昆仑掌门', description: '隐居深山的绝世高手', sourceStoryId: 's1', emoji: '🏔️' },
  { id: 'fc-3', type: 'character', name: '杜丽娘', description: '深闺中多情的官家小姐', sourceStoryId: 's2', emoji: '🌸' },
  { id: 'fc-4', type: 'character', name: '柳梦梅', description: '风度翩翩的穷酸书生', sourceStoryId: 's2', emoji: '📝' },
  { id: 'fc-5', type: 'character', name: '刘皇叔', description: '仁义著天下的汉室宗亲', sourceStoryId: 's3', emoji: '👑' },
  { id: 'fc-6', type: 'character', name: '曹孟德', description: '雄才大略的一代枭雄', sourceStoryId: 's3', emoji: '🗡️' },
  { id: 'fc-7', type: 'character', name: '胡三姐', description: '修炼千年的白衣狐仙', sourceStoryId: 's4', emoji: '🦊' },
  { id: 'fc-8', type: 'character', name: '王书生', description: '手无缚鸡之力的穷书生', sourceStoryId: 's4', emoji: '📚' },
  { id: 'fc-9', type: 'character', name: '贾知县', description: '花钱捐官的市井小人', sourceStoryId: 's5', emoji: '💰' },
  { id: 'fc-10', type: 'character', name: '钱师爷', description: '八面玲珑的官场老油条', sourceStoryId: 's5', emoji: '🧮' },
  { id: 'fc-11', type: 'character', name: '齐天大圣', description: '大闹天宫的美猴王', sourceStoryId: 's6', emoji: '🐵' },
  { id: 'fc-12', type: 'character', name: '唐三藏', description: '西天取经的得道高僧', sourceStoryId: 's6', emoji: '🙏' },

  { id: 'fl-1', type: 'location', name: '昆仑雪峰', description: '终年积雪的绝世秘境', sourceStoryId: 's1', emoji: '❄️' },
  { id: 'fl-2', type: 'location', name: '牡丹亭', description: '月下花前的幽会之所', sourceStoryId: 's2', emoji: '🏯' },
  { id: 'fl-3', type: 'location', name: '桃园', description: '三人结义的桃花胜景', sourceStoryId: 's3', emoji: '🍑' },
  { id: 'fl-4', type: 'location', name: '荒山古宅', description: '夜半鬼哭的阴森古宅', sourceStoryId: 's4', emoji: '🏚️' },
  { id: 'fl-5', type: 'location', name: '县衙大堂', description: '威严之下藏污纳垢的公堂', sourceStoryId: 's5', emoji: '⚖️' },
  { id: 'fl-6', type: 'location', name: '花果山', description: '仙石灵猴的洞天福地', sourceStoryId: 's6', emoji: '⛰️' },
  { id: 'fl-7', type: 'location', name: '黄泉渡口', description: '阴阳交汇的忘川之畔', sourceStoryId: 's1', emoji: '🌊' },
  { id: 'fl-8', type: 'location', name: '太虚幻境', description: '镜花水月的仙家秘境', sourceStoryId: 's2', emoji: '✨' },
  { id: 'fl-9', type: 'location', name: '铜雀台', description: '曹操宴饮赋诗的楼台', sourceStoryId: 's3', emoji: '🏛️' },
  { id: 'fl-10', type: 'location', name: '阎罗殿', description: '阴曹地府的判官公堂', sourceStoryId: 's6', emoji: '🔥' },

  { id: 'fx-1', type: 'conflict', name: '师门血仇', description: '灭门之恨不共戴天', sourceStoryId: 's1', emoji: '💢' },
  { id: 'fx-2', type: 'conflict', name: '生死相思', description: '阴阳两隔的刻骨之恋', sourceStoryId: 's2', emoji: '💔' },
  { id: 'fx-3', type: 'conflict', name: '天下纷争', description: '群雄逐鹿的乱世之争', sourceStoryId: 's3', emoji: '⚡' },
  { id: 'fx-4', type: 'conflict', name: '人妖殊途', description: '人妖之间不可逾越的鸿沟', sourceStoryId: 's4', emoji: '🌀' },
  { id: 'fx-5', type: 'conflict', name: '贪墨成风', description: '官场上行下效的腐败横行', sourceStoryId: 's5', emoji: '🪙' },
  { id: 'fx-6', type: 'conflict', name: '逆天改命', description: '不甘天命束缚的抗争', sourceStoryId: 's6', emoji: '🌠' },
  { id: 'fx-7', type: 'conflict', name: '兄弟反目', description: '昔日情义一朝尽碎', sourceStoryId: 's1', emoji: '⚔️' },
  { id: 'fx-8', type: 'conflict', name: '真假难辨', description: '虚实交错中谁是真身', sourceStoryId: 's4', emoji: '🎭' },
  { id: 'fx-9', type: 'conflict', name: '忠义两难', description: '家国大义与私人恩义的抉择', sourceStoryId: 's3', emoji: '⚖️' },
]

export const DREAM_RECIPES: DreamRecipe[] = [
  {
    id: 'dr-1',
    storyId: 's1',
    characterId: 'fc-1',
    locationId: 'fl-7',
    conflictId: 'fx-7',
    hiddenBranch: {
      id: 'dream-b1',
      title: '梦境·黄泉剑意',
      content: '白衣剑客于黄泉渡口偶遇旧日师兄，方知灭门真凶并非仇家，而是朝中权臣布局。剑客弃仇从义，渡阴阳之河，寻正道之途……',
      tags: ['武侠', '悬疑', '梦境'],
      heatModifier: 20,
    },
  },
  {
    id: 'dr-2',
    storyId: 's2',
    characterId: 'fc-3',
    locationId: 'fl-8',
    conflictId: 'fx-2',
    hiddenBranch: {
      id: 'dream-b2',
      title: '梦境·太虚还魂',
      content: '杜丽娘魂入太虚幻境，得仙人指点还阳之法。需以真心泪滴灌牡丹根，三更月下重返人间，与柳郎再续前缘……',
      tags: ['爱情', '神怪', '梦境'],
      heatModifier: 18,
    },
  },
  {
    id: 'dr-3',
    storyId: 's3',
    characterId: 'fc-6',
    locationId: 'fl-9',
    conflictId: 'fx-9',
    hiddenBranch: {
      id: 'dream-b3',
      title: '梦境·铜雀赋悲',
      content: '曹孟德登铜雀台远眺，忽忆起当年与关公赠马之义。忠义两难间，枭雄挥泪赋诗，道尽英雄末路之悲凉……',
      tags: ['历史', '义气', '梦境'],
      heatModifier: 22,
    },
  },
  {
    id: 'dr-4',
    storyId: 's4',
    characterId: 'fc-7',
    locationId: 'fl-4',
    conflictId: 'fx-8',
    hiddenBranch: {
      id: 'dream-b4',
      title: '梦境·真假狐仙',
      content: '荒山古宅之中，狐仙胡三姐发现另一只妖物假扮自己行骗。真假狐仙斗法，书生在旁分辨，方知真心的温度远胜皮囊……',
      tags: ['神怪', '悬疑', '梦境'],
      heatModifier: 16,
    },
  },
  {
    id: 'dr-5',
    storyId: 's6',
    characterId: 'fc-11',
    locationId: 'fl-10',
    conflictId: 'fx-6',
    hiddenBranch: {
      id: 'dream-b5',
      title: '梦境·大闹阎罗',
      content: '齐天大圣闯入阎罗殿，翻开生死簿，发现自己竟是天地初开时的一缕怨念。逆天改命，还是顺应天理？猴王陷入前所未有的抉择……',
      tags: ['神怪', '热血', '梦境'],
      heatModifier: 25,
    },
  },
  {
    id: 'dr-6',
    storyId: 's5',
    characterId: 'fc-9',
    locationId: 'fl-5',
    conflictId: 'fx-5',
    hiddenBranch: {
      id: 'dream-b6',
      title: '梦境·官帽奇谈',
      content: '贾知县忽得一梦，梦见官帽长出双翅，竟能飞上天庭。醒来后他改头换面，一反贪腐常态，竟成了难得一见的清官……',
      tags: ['讽刺', '奇幻', '梦境'],
      heatModifier: 19,
    },
  },
]

const WRONG_COMBO_TITLES = [
  '荒腔·{character}闯{location}',
  '走板·{location}里的{character}',
  '怪谈·{conflict}之{character}传',
]

const WRONG_COMBO_TEMPLATES = [
  '话说{character}不知怎的竟误入{location}，{conflict}之下闹出天大的笑话。众人目瞪口呆之际，{character}竟哈哈大笑道：「此番奇遇，倒是闻所未闻！」此事一传十十传百，成了茶楼里最新的笑谈。',
  '那日{location}忽现异象，{character}被卷入{conflict}之中，本应惊天动地，却因一个喷嚏打了岔，结局峰回路转，竟成了一段啼笑皆非的荒诞传奇。',
  '有人言之凿凿，说亲眼见{character}在{location}中遭遇{conflict}，场面一度十分惊险，谁知{character}竟以一曲小调化解干戈。从此坊间多了个不靠谱的传说。',
]

export function generateRumorContent(
  characterName: string,
  locationName: string,
  conflictName: string
): { title: string; content: string } {
  const titleTemplate = WRONG_COMBO_TITLES[Math.floor(Math.random() * WRONG_COMBO_TITLES.length)]
  const contentTemplate = WRONG_COMBO_TEMPLATES[Math.floor(Math.random() * WRONG_COMBO_TEMPLATES.length)]

  const title = titleTemplate
    .replace('{character}', characterName)
    .replace('{location}', locationName)
    .replace('{conflict}', conflictName)

  const content = contentTemplate
    .replace(/{character}/g, characterName)
    .replace(/{location}/g, locationName)
    .replace(/{conflict}/g, conflictName)

  return { title, content }
}

export function getFragmentsForStory(storyId: string): DreamFragment[] {
  return FRAGMENT_POOL.filter((f) => f.sourceStoryId === storyId)
}
