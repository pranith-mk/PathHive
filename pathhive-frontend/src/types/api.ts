

// 1. Define Tag FIRST so Path can use it
export interface Tag {
  id: string;
  name: string;
}

// 2. Define Resource (for Steps)
export interface Resource {
  id: string;
  title: string;
  url: string;
  resource_type: 'video' | 'article' | 'documentation' | 'project' | 'file';
}

// 3. Define Step (for Path)
export interface Step {
  id: string;
  title: string;
  description: string;
  position: number;
  resources: Resource[];
}

// 4. Now Path can use Tag and Step without errors
export interface Path {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  creator: User;
  tags: Tag[]; // <--- Now TypeScript knows what "Tag" is!
  is_published: boolean;
  created_at: string;
  steps?: Step[];
  is_enrolled?: boolean;
  completed_steps?: string[];
  comments_count?: number;
  enrollmentCount?: number;
}

// 5. Payload for creating a path
export interface ResourcePayload {
  title: string;
  url: string;
  type: string;
}

export interface StepPayload {
  title: string;
  description: string;
  resources: ResourcePayload[];
}

export interface CreatePathPayload {
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  is_published: boolean;
  steps: StepPayload[];
}

// Add Comment Interface
export interface Comment {
  id: number;
  user: User;
  text: string;
  created_at: string;
  parent: number | null;
  replies?: Comment[];
}

export interface User {  
  id: string | number;
  username: string;
  email: string;
  role?: 'user' | 'admin';
  full_name?: string; // Django might send this if your serializer includes it
  avatar?: string;
  is_staff?: boolean;
  is_active?: boolean; 
  created_at?: string;
}

export interface ReportPayload {
  report_type: 'user' | 'path' | 'comment';
  target_id: number | string;
  reason: string;
}

export interface Report {
  id: number;
  reporter_name: string;
  report_type: string;
  target_id: number;
  reason: string;
  created_at: string;
  is_resolved: boolean;
}

export interface AdminStats {
  total_users: number;
  total_paths: number;
  total_comments: number;
  pending_reports: number;
}