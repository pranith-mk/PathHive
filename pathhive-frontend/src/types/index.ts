// PathHive Types

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  bio?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creator?: User;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublished: boolean;
  publishedAt?: Date;
  allowComments: boolean;
  tags: Tag[];
  steps: PathStep[];
  enrollmentCount: number;
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PathStep {
  id: string;
  pathId: string;
  title: string;
  description: string;
  position: number;
  resources: Resource[];
  createdAt: Date;
}

export interface Resource {
  id: string;
  stepId: string;
  resourceType: 'video' | 'article' | 'documentation' | 'exercise' | 'project';
  title: string;
  url: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  pathId: string;
  enrolledAt: Date;
  completedAt?: Date;
}

export interface StepProgress {
  id: string;
  enrollmentId: string;
  stepId: string;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface PathRating {
  id: string;
  userId: string;
  pathId: string;
  rating: number;
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  user?: User;
  pathId: string;
  parentId?: string;
  content: string;
  createdAt: Date;
  replies?: Comment[];
}

export interface Bookmark {
  id: string;
  userId: string;
  pathId: string;
  createdAt: Date;
}

export interface AIConversation {
  id: string;
  userId: string;
  pathId?: string;
  createdAt: Date;
  messages: AIMessage[];
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export type ReportType = 'path' | 'user' | 'comment';
export type ReportReason = 
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'misinformation'
  | 'copyright'
  | 'other';

export interface Report {
  id: string;
  reporterId: string;
  reporter?: User;
  reportType: ReportType;
  targetId: string;
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
  resolvedAt?: Date;
}

export type NotificationType = 
  | 'comment_on_path'
  | 'reply_to_comment'
  | 'path_published'
  | 'path_updated'
  | 'report_received';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkTo?: string;
  isRead: boolean;
  createdAt: Date;
}
