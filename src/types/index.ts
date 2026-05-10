export type Role = 'user' | 'admin';

export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  photo: string;
  role: Role;
  status?: 'active' | 'blocked';
  createdAt: Date;
}

export type MessageSender = 'user' | 'AI' | 'admin';
export type MessageType = 'chat' | 'ad' | 'system';

export interface Message {
  id?: string;
  chatId: string;
  userId: string;
  sender: MessageSender;
  text: string;
  timestamp: any; // Firestore Timestamp
  type: MessageType;
  adRef?: string;
}

export interface Chat {
  id: string;
  userId: string;
  lastMessage: string;
  isSupport?: boolean;
  updatedAt: any; // Firestore Timestamp
}

export interface Ad {
  id: string;
  image: string;
  link: string;
  title: string;
  ctaText?: string;
  active: boolean;
  allowedRoles: Role[];
  createdAt: any;
}

export interface UserMemory {
  userId: string;
  goals: string;
  interest: string;
  summary: string;
}

export interface About {
  id: string;
  mission: string;
  features: string;
  updatedAt: any;
}

export interface Feedback {
  id: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  message: string;
  createdAt: any;
}

export interface SupportConfig {
  id: string;
  whatsapp: string;
  email: string;
  facebook: string;
  updatedAt: any;
}

export interface AppSettings {
  id: string;
  tagline: string;
  updatedAt: any;
}

export interface ThemeSettings {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  headerColor: string;
  headerTextColor: string;
  footerColor: string;
  userBubbleColor: string;
  aiBubbleColor: string;
  bubbleTextColor: string;
  updatedAt: any;
}

export interface DeveloperInfo {
  id: string;
  bio: string;
  updatedAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}
