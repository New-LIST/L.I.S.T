export type CourseTaskSetRel = {
  id: number;
  taskSetTypeId: number;
  uploadSolution: boolean;
  minPoints: number | null;
  minPointsInPercentage: boolean;
  includeInTotal: boolean;
  virtual: boolean;
  formula: string;
};