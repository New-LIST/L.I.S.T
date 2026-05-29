export type AssistantCoursePermission = {
    id?: number;
    userId: number;
    courseId: number;
    courseName?: string;
    periodName?: string;
    canViewCourseContent: boolean;
    canManageCourseContent: boolean;
    canGradeCourse: boolean;
    canRunPlagiarismCheck: boolean;
};
