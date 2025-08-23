export enum TestType {
    PythonIO,
    PythonUnit,
    JavaUnit,
    CUnit,
    Txt
}

export const testTypeToString = (type: TestType) => {
    switch (type) {
        case TestType.PythonIO:
            return "Python I/O";
        case TestType.PythonUnit:
            return "Python Unit";
        case TestType.JavaUnit:
            return "Java Unit";
        case TestType.CUnit:
            return "C Unit";
        case TestType.Txt:
            return "Text";
    }
}