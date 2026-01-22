import { User } from './index';

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