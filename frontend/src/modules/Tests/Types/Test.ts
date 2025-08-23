import {TestType} from "./TestType.ts";

export type Test = {
    id: number;
    name: string;
    type: TestType;
    timeout: number;
    allowed: boolean;
    evaluate: boolean;
}