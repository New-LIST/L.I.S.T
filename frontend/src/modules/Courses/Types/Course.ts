export type Course = {
    id: number;
    name: string;
    periodName: string;
    capacity: number;
    groupChangeDeadline: string | null;
    enrollmentLimit: string | null;
    hiddenInList: boolean;
    autoAcceptStudents: boolean;
    teacher?: string;
    imageUrl?: string;
  };