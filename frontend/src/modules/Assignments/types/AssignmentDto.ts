export type AssignmentDto = {
  name: string;
  courseId: number;
  taskSetTypeId: number;
  published: boolean;
  publishStartTime: string | null;
  uploadEndTime: string | null;
  pointsOverride: number | null;
  instructions: string | null;
  internalComment: string | null;
};
