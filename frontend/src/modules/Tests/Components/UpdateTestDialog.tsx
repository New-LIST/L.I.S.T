import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel, FormLabel, MenuItem, Radio,
    RadioGroup,
    TextField, Typography
} from "@mui/material";
import React, {useState} from "react";
import {Test} from "../Types/Test.ts";
import {Task} from "../../Tasks/Types/Task.ts";
import {TestType, testTypeToString} from "../Types/TestType.ts";

type DialogProps = {
    isOpen: boolean;
    onSubmit: (test: Test) => void;
    onClose: () => void;
    tasks: Task[];
    taskId: number | null;
    setTaskId: (id: number | null) => void;
    sourceFile: File | null;
    setSourceFile: (file: File | null) => void;
    testToUpdate: Test;
}

export const UpdateTestDialog = (
    {
        isOpen,
        onSubmit,
        onClose, 
        tasks, 
        taskId, 
        setTaskId,
        sourceFile,
        setSourceFile,
        testToUpdate,
    }: DialogProps) => {
    const [nameInput, setNameInput] = useState(testToUpdate.name);
    const [nameError, setNameError] = useState<string | null>(null);
    
    const [testType, setTestType] = useState<TestType>(testToUpdate.type);
    const [testTypeError, setTestTypeError] = useState<string | null>(null);
    
    const [timeout, setTimeout] = useState<number>(testToUpdate.timeout);
    const [timeoutError, setTimeoutError] = useState<string | null>(null);
    
    const [allowed, setAllowed] = useState<boolean>(testToUpdate.allowed);
    const [allowedError, setAllowedError] = useState<string | null>(null);
    
    const [evaluate, setEvaluate] = useState<boolean>(testToUpdate.evaluate);
    const [evaluateError, setEvaluateError] = useState<string | null>(null);
    
    const [taskError, setTaskError] = useState<string | null>(null);
    
    const [sourceFileError, setSourceFileError] = useState<string | null>(null);

    const resetValues = () => {
        setNameInput("");
        setNameError(null);
        setTestType(TestType.PythonIO);
        setTestTypeError(null);
        setTimeout(10000);
        setTimeoutError(null);
        setAllowed(true);
        setAllowedError(null);
        setEvaluate(true);
        setEvaluateError(null);
        setTaskId(null);
        setTaskError(null);
        setSourceFile(null);
        setSourceFileError(null);
    }

    const validate = () => {
        if (nameInput.trim().length === 0) {
            setNameError("Pridajte Názov");
        } else {
            setNameError(null);
        }
        if (testType === null) {
            setTestTypeError("Vyberte typ testu");
        } else {
            setTestTypeError(null);
        }
        if (taskId === null) {
            setTaskError("Vyberte úlohu")
        } else {
            setTaskError(null);
        }
    }
    const isValid = (): boolean => {
        validate()
        if (nameInput.trim().length === 0)
            return false;
        if (testType === null)
            return false;
        if (taskId === null)
            return false;
        return true;
    }

    return (
        <Dialog fullWidth open={isOpen} onClose={() => {}}>
            <DialogTitle>Editovať {testToUpdate.name}</DialogTitle>
            <DialogContent dividers
                           sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
                <TextField
                    id="name"
                    name="name"
                    type="text"
                    value={nameInput}
                    label="Názov"
                    onChange={(e) => {
                        setNameInput(e.target.value);
                        if (e.target.value === "") {
                            setNameError("Pridajte Názov");
                        } else {
                            setNameError(null);
                        }
                    }}
                    error={!!nameError}
                    helperText={nameError}
                    required />
                <TextField
                    select
                    label="Úlohy"
                    value={taskId}
                    onChange={(e) =>
                        setTaskId(
                            e.target.value === "" ? null : Number(e.target.value)
                        )
                    }
                    error={!!taskError}
                    helperText={taskError}
                    fullWidth
                    required
                >
                    {tasks.map((task) => (
                        <MenuItem key={task.id} value={task.id}>
                            {task.name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Typ testu"
                    value={testType}
                    onChange={(e) => setTestType(e.target.value as TestType)}
                    error={!!testTypeError}
                    helperText={testTypeError}
                    fullWidth
                    required
                >
                    <MenuItem key={TestType.PythonIO} value={TestType.PythonIO}>
                        {testTypeToString(TestType.PythonIO)}
                    </MenuItem>
                    <MenuItem key={TestType.PythonUnit} value={TestType.PythonUnit}>
                        {testTypeToString(TestType.PythonUnit)}
                    </MenuItem>
                    <MenuItem key={TestType.JavaUnit} value={TestType.JavaUnit}>
                        {testTypeToString(TestType.JavaUnit)}
                    </MenuItem>
                    <MenuItem key={TestType.CUnit} value={TestType.CUnit}>
                        {testTypeToString(TestType.CUnit)}
                    </MenuItem>
                    <MenuItem key={TestType.Txt} value={TestType.Txt}>
                        {testTypeToString(TestType.Txt)}
                    </MenuItem>
                </TextField>
                <TextField
                    select
                    label="Povolený"
                    value={allowed ? "true" : "false"}
                    onChange={(e) => setAllowed(e.target.value === "true")}
                    error={!!allowedError}
                    helperText={allowedError}
                    fullWidth
                    required
                >
                    <MenuItem value="false">Nie</MenuItem>
                    <MenuItem value="true">Áno</MenuItem>
                </TextField>
                <TextField
                    select
                    label="Hodnotený"
                    value={evaluate ? "true" : "false"}
                    onChange={(e) => setEvaluate(e.target.value === "true")}
                    error={!!evaluateError}
                    helperText={evaluateError}
                    fullWidth
                    required
                >
                    <MenuItem value="false">Nie</MenuItem>
                    <MenuItem value="true">Áno</MenuItem>
                </TextField>
                <TextField
                    label="Časový limit"
                    value={timeout}
                    onChange={(e) => setTimeout(Number(e.target.value))}
                    error={!!timeoutError}
                    helperText={timeoutError}
                    required
                    fullWidth
                    type="number"
                ></TextField>
                <Button variant="outlined" component="label">
                    Nahrať Kód Testu (ZIP)
                    <input
                        type="file"
                        accept="application/zip"
                        hidden
                        onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setSourceFile(file);
                        }}
                    />
                </Button>
                {sourceFile && (
                    <Typography variant="body2" color="text.secondary">
                        {sourceFile.name}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    resetValues();
                    onClose();
                }}
                        variant="text"
                        color="warning">
                    Zrušiť
                </Button>
                <Button onClick={() => {
                    if (isValid()) {
                        const test: Test = {
                            id: 0,
                            name: nameInput,
                            type: testType,
                            timeout: timeout,
                            allowed: allowed,
                            evaluate: evaluate
                        };
                        onSubmit(test);
                        onClose();
                    } else {
                        console.error("Invalid test data");
                    }
                }}
                        variant="contained"
                >
                    Pridať
                </Button>
            </DialogActions>
        </Dialog>
    );
}
