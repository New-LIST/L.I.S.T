// src/modules/assignments/types/gradeMatrix.ts

export interface AssignmentInfo {
  assignmentId: number;
  assignmentName: string;
}

export interface GradeMatrixType {
  relId: number;
  taskSetTypeId: number;
  taskSetTypeName: string;
  virtual: boolean;
  minPoints: number | null;
  minPointsInPercentage: boolean;
  includeInTotal: boolean;
  maxPoints: number;
  assignments: AssignmentInfo[];
}

export interface StudentGrade {
  studentId: number;
  fullName: string;
  group?: string;
  points: Record<number, number | null>;
  sectionTotals: Record<number, number>;
}

export interface GradeMatrixDto {
  courseId: number;
  courseName: string;
  periodName: string;
  types: GradeMatrixType[];
  students: StudentGrade[];
}
