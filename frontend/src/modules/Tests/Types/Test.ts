import {TestType} from "./TestType.ts";

export type Test = {
    id: number;
    name: string;
    taskId: number;
    testType: TestType;
    timeout: number;
}