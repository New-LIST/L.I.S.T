
export interface TaskForPreview {
  id: number;
  name: string;
  text: string;
  internalComment: string;
  authorName: string;
}

export interface AssignmentTaskForPreview {
  taskId: number;
  task: TaskForPreview;
  assignmentId: number;
  pointsTotal: number;
  bonusTask: boolean;
  internalComment: string;
}
