export interface DiscordUser {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  avatarUrl: string;
  isMember: boolean;
  nickname: string | null;
  roleIds: string[];
  rank: { name: string; level: number } | null;
  division: { code: string; name: string } | null;
  isCommander: boolean;
  displayName: string;
}

export interface Soldier {
  id: string;
  name: string;
  rankId: number;
  division: DivisionCode;
  position?: string;
  discord?: string;
  status: 'В СТРОЮ' | 'ОТПУСК' | 'РЕЗЕРВ';
  warnings: number;
  medals: string[];
  joinDate: string;
  avatar: string;
}

export interface Rank {
  id: number;
  name: string;
  salary: number;
  accessLevel: number;
}

export interface StatuteChapter {
  id: string;
  title: string;
  description: string;
  articles: { num: string; text: string }[];
}

export interface JoinRequirement {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export interface JoinStep {
  id: number;
  title: string;
  desc: string;
  badge: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIdx: number;
}

export type DivisionCode = 'Штаб В/Ч' | 'ВП' | '9-я рота' | '12-й бат.' | 'Военкомат' | 'МТО' | 'Академия';

export type TabType = 'home' | 'guide' | 'statutes' | 'roster' | 'divisions' | 'test';

export interface RecruitApplication {
  id: string;
  code: string;
  name: string;
  createdAt: Date;
}
