export type AssignmentDto = {
  name: string;
  taskSetTypeId: number;
  courseId: number;
  teacherId: number;
  published: boolean;
  publishStartTime: string | null;
  uploadEndTime: string | null;
  instructions: string | null;
  pointsOverride: number | null;
  internalComment: string | null;
};
