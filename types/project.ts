export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  workspaceId: string;
}
