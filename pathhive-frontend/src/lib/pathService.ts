import api from './api';
import { Path, CreatePathPayload, Comment } from '../types/api';
import { ReportPayload, Report, AdminStats, User, Review } from '@/types/api';


export interface CreatorProfileData {
  profile: {
    id: string;
    username: string;
    full_name: string;
    bio: string;
    avatar: string | null;
    date_joined: string;
  };
  stats: {
    total_students: number;
    total_paths: number;
    average_rating: number;
  };
  paths: Path[];
}

export const pathService = {
  // 1. Get all published paths
  getAllPaths: async (): Promise<Path[]> => {
    const response = await api.get('/paths/list/');
    return response.data;
  },

  // 2. Create a new path
  createPath: async (data: CreatePathPayload): Promise<Path> => {
    const response = await api.post('/paths/list/', data);
    return response.data;
  },

  // 3. Get details of one specific path
  getPathById: async (id: string): Promise<Path> => {
    const response = await api.get(`/paths/list/${id}/`);
    return response.data;
  },

  // 5. Get Tags
  getAllTags: async (): Promise<{ id: string, name: string }[]> => {
    const response = await api.get('/paths/tags/');
    return response.data;
  },

  // 6. Enroll in a path
  enrollInPath: async (pathId: string): Promise<void> => {
    await api.post(`/paths/list/${pathId}/enroll/`);
  },

  unenrollFromPath: async (pathId: string) => {
    const response = await api.post(`/paths/list/${pathId}/unenroll/`);
    return response.data;
  },

  // 7. Toggle step completion
  toggleStep: async (pathId: string, stepId: string): Promise<void> => {
    await api.post(`/paths/list/${pathId}/toggle-step/${stepId}/`);
  },

  // 8. Get My Enrollments (Dashboard)
  getMyEnrollments: async (): Promise<Path[]> => {
    const response = await api.get('/paths/list/my_enrollments/');
    return response.data;
  },

  // 9. Get My Created Paths (Dashboard)
  getCreatedPaths: async (): Promise<Path[]> => {
    const response = await api.get('/paths/list/created_by_me/');
    return response.data;
  },

  // 10. Get Comments
  getComments: async (pathId: string): Promise<Comment[]> => {
    const response = await api.get(`/paths/list/${pathId}/comments/`);
    return response.data;
  },

  // 11. Add Comment (Threaded)
  addComment: async (pathId: string, text: string, parentId?: number): Promise<Comment> => {
    const response = await api.post(`/paths/list/${pathId}/add_comment/`, {
      text,
      parent_id: parentId
    });
    return response.data;
  },

  // 12. Delete Comment
  deleteComment: async (pathId: string, commentId: number): Promise<void> => {
    await api.delete(`/paths/list/${pathId}/comments/${commentId}/`);
  },

  // 13. Submit a Report
  submitReport: async (data: ReportPayload): Promise<void> => {
    await api.post('/reports/', data);
  },

  // 14. Get All Reports (Admin only)
  getReports: async (): Promise<Report[]> => {
    const response = await api.get('/reports/');
    return response.data;
  },

  // 15. Resolve Report (Admin only)
  resolveReport: async (reportId: number): Promise<void> => {
    await api.post(`/reports/${reportId}/resolve/`);
  },

  // 16. Get Admin Stats
  getAdminStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats/');
    return response.data;
  },

  // 17. Get All Users (Admin)
  getUsers: async (search?: string): Promise<User[]> => {
    const params = search ? { search } : {};
    const response = await api.get('/admin/users/', { params });
    return response.data.results || response.data;
  },

  // 18. Delete User (Admin)
  deleteUser: async (userId: string | number): Promise<void> => {
    await api.delete(`/admin/users/${userId}/`);
  },

  // 19. Get All Paths (Admin)
  getAdminPaths: async (search?: string): Promise<Path[]> => {
    const params = search ? { search } : {};
    const response = await api.get('/admin/paths/', { params });
    return response.data.results || response.data;
  },

  // 20. Delete Path (Admin)
  deletePath: async (pathId: string | number): Promise<void> => {
    await api.delete(`/admin/paths/${pathId}/`);
  },

  // 21. Get Reviews for a Path
  getReviews: async (pathId: string | number): Promise<Review[]> => {
    const response = await api.get(`/reviews/?path_id=${pathId}`);
    return response.data.results || response.data;
  },

  // 22. Submit a Review
  createReview: async (pathId: string | number, rating: number, comment: string): Promise<Review> => {
    const response = await api.post('/reviews/', {
      path: pathId,
      rating,
      comment
    });
    return response.data;
  },

  // 23. Check if current user has reviewed a path
  getUserReview: async (pathId: string | number): Promise<Review | null> => {
    const response = await api.get(`/reviews/me/?path_id=${pathId}`);
    return response.data || null;
  },

  // 24. Update an existing Review
  updateReview: async (reviewId: number, rating: number, comment: string): Promise<Review> => {
    const response = await api.patch(`/reviews/${reviewId}/`, {
      rating,
      comment
    });
    return response.data;
  },

  // 25. Update Path Details
  updatePath: async (id: string, data: Partial<Path>): Promise<Path> => {
    const response = await api.patch(`/paths/list/${id}/`, data);
    return response.data;
  },

  // 26. Delete a Path (Creator)
  deletePathCreator: async (id: string): Promise<void> => {
    await api.delete(`/paths/list/${id}/`);
  },

  // ====================================================
  // PATH EDITOR (CURRICULUM)
  // ====================================================

  // 27. Create a Step
  createStep: async (pathId: string, data: any) => {
    const response = await api.post('/paths/steps/', { ...data, path: pathId });
    return response.data;
  },

  // 28. Update a Step
  updateStep: async (stepId: string, data: any) => {
    const response = await api.patch(`/paths/steps/${stepId}/`, data);
    return response.data;
  },

  // 29. Delete a Step
  deleteStep: async (stepId: string) => {
    await api.delete(`/paths/steps/${stepId}/`);
  },

  // 30. Create a Resource (Fixes 400/415 Error)
  createResource: async (stepId: string, data: any) => {
    // 🔍 DEBUG: Log what we are receiving
    console.log("createResource called with:", data);

    // If we have a file, we MUST use FormData
    if (data.file) {
      const formData = new FormData();
      formData.append("step", stepId);
      formData.append("title", data.title);
      formData.append("resource_type", data.resource_type);

      // Append the actual file object
      formData.append("file", data.file);

      if (data.description) {
        formData.append("description", data.description);
      }

      // ⚠️ IMPORTANT: Pass formData directly. 
      // Do NOT set "Content-Type" header manually; Axios does it automatically.
      const response = await api.post('/paths/resources/', formData);
      return response.data;
    }

    // If it's just a Link (no file), standard JSON is fine
    const response = await api.post('/paths/resources/', { ...data, step: stepId });
    return response.data;
  },

  // ====================================================
  // CREATOR PROFILE
  // ====================================================

  getCreatorProfile: async (creatorId: string) => {

    const response = await api.get(`/paths/creators/${creatorId}/`);
    return response.data as CreatorProfileData;
  },
};