// src/modules/Assignments/types/AssignmentTaskRelSlim.ts

export interface TaskSlim {
  id: number;
  name: string;
  text: string;
  internalComment: string;
  authorId: number;
  fullname: string;
}

export interface AssignmentTaskRelSlim {
  taskId: number;
  task: TaskSlim;
  assignmentId: number;
  pointsTotal: number;
  bonusTask: boolean;
  internalComment: string;

  // UI-flagy, nie od servera
  isSaving?: boolean;
  previewOpen?: boolean;
}
