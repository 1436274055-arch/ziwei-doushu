export type TopicKey = 'overview' | 'personality' | 'love' | 'career' | 'wealth' | 'health' | 'family' | 'children' | 'move' | 'friends' | 'home' | 'spirit' | 'parents';

export interface StarContent {
  mingGong: string;
  personality: string;
  love: string;
  career: string;
  wealth: string;
  health: string;
  family: string;
  children: string;
  move: string;
  friends: string;
  home: string;
  spirit: string;
  parents: string;
}

export const TOPIC_LABEL: Record<TopicKey, string> = {
  overview: '总览',
  personality: '性格',
  love: '感情',
  career: '事业',
  wealth: '财运',
  health: '健康',
  family: '家庭',
  children: '子女',
  move: '迁移',
  friends: '交友',
  home: '田宅',
  spirit: '福德',
  parents: '父母',
};

export const TOPIC_PALACE_NAME: Record<TopicKey, string> = {
  overview: '命宫',
  personality: '命宫',
  love: '夫妻宫',
  career: '官禄宫',
  wealth: '财帛宫',
  health: '疾厄宫',
  family: '兄弟宫',
  children: '子女宫',
  move: '迁移宫',
  friends: '交友宫',
  home: '田宅宫',
  spirit: '福德宫',
  parents: '父母宫',
};

const emptyStar: StarContent = {
  mingGong: '', personality: '', love: '', career: '', wealth: '', health: '',
  family: '', children: '', move: '', friends: '', home: '', spirit: '', parents: '',
};

export const STAR_DB: Record<string, StarContent> = {
  '紫微': { ...emptyStar, mingGong: '【紫微在命宫】帝星坐命，气质高贵，有领导才能，好面子，喜受人尊敬。', personality: '紫微坐命者，自尊心强，有领袖气质，行事稳重，但有时刚愎自用。' },
  '天机': { ...emptyStar, mingGong: '【天机在命宫】智谋之星，思维敏捷，善策划，但多思多虑，易犹豫不决。' },
  '太阳': { ...emptyStar, mingGong: '【太阳在命宫】光明磊落，热情大方，乐于助人，但有时过于付出，需注意分寸。' },
  '武曲': { ...emptyStar, mingGong: '【武曲在命宫】财星坐命，刚毅果决，执行力强，但个性刚直，需以柔克刚。' },
  '天同': { ...emptyStar, mingGong: '【天同在命宫】福星坐命，性情温和，知足常乐，但易安于现状，缺乏进取心。' },
  '廉贞': { ...emptyStar, mingGong: '【廉贞在命宫】次桃花星，个性多变，聪明机敏，但情绪起伏大，需修心养性。' },
  '天府': { ...emptyStar, mingGong: '【天府在命宫】南斗主星，稳重可靠，有管理才能，但保守谨慎，不喜变化。' },
  '太阴': { ...emptyStar, mingGong: '【太阴在命宫】阴柔之星，性情温婉，情感丰富，但多愁善感，需培养决断力。' },
  '贪狼': { ...emptyStar, mingGong: '【贪狼在命宫】桃花正星，多才多艺，交际广泛，但欲望强烈，需修身养性。' },
  '巨门': { ...emptyStar, mingGong: '【巨门在命宫】暗曜之星，口才佳，善分析，但易招惹是非，需谨言慎行。' },
  '天相': { ...emptyStar, mingGong: '【天相在命宫】印星坐命，为人正直，善于协调，但缺乏主见，易随波逐流。' },
  '天梁': { ...emptyStar, mingGong: '【天梁在命宫】寿星坐命，慈悲为怀，乐于助人，但好管闲事，需把握分寸。' },
  '七杀': { ...emptyStar, mingGong: '【七杀在命宫】将星坐命，魄力十足，敢作敢为，但刚烈易折，需以智取胜。' },
  '破军': { ...emptyStar, mingGong: '【破军在命宫】破旧立新之星，勇于变革，行动力强，但破坏力大，需三思后行。' },
};
