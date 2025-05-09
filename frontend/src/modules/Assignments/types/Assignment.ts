import { TaskSetType } from "../../TaskSets/Types/TaskSetType";
import { Course } from "../../Courses/Types/Course";
import { CourseTaskSetRel } from "../../TaskSets/Types/CourseTaskSetRel";
import { User } from "../../Users/types/User";

export type Assignment = {
  id: number,
  name: string;
  taskSetTypeId: number;
  taskSetType: TaskSetType;
  courseId: number;
  course: Course;
  teacherId: number;
  teacher: User;
  published: boolean;
  publishStartTime: string | null;
  uploadEndTime: string | null;
  instructions: string | null;
  pointsOverride: number | null;
  internalComment: string | null;
  courseTaskSetRel: CourseTaskSetRel;
};
