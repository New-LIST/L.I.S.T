export type Task = {
    id: number;
    name: string;
    text?: string;
    internalComment?: string;
    created: string;
    updated: string;
    authorFullname: string;
    parentTaskId?: number;
};