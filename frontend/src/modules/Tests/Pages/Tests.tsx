import React, {useCallback, useEffect, useState} from 'react';
import api from "../../../services/api.ts";
import {
    alpha,
    Box,
    Button,
    Card, Icon,
    IconButton,
    InputBase,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer, TableFooter,
    TableHead,
    TablePagination,
    TableRow, Tooltip,
    Typography
} from "@mui/material";
import { useNotification } from "../../../shared/components/NotificationContext"
import EditIcon from "@mui/icons-material/Edit";
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import DeleteIcon from "@mui/icons-material/Delete";
import {PagedResult} from "../../../shared/Interfaces/PagedResult.ts";
import {Test} from "../Types/Test.ts";
import {TestType, testTypeToString} from "../Types/TestType.ts";
import {CreateTestDialog} from "../Components/CreateTestDialog.tsx";
import {AxiosError, AxiosResponse} from "axios";
import {Task} from "../../Tasks/Types/Task.ts";
import ConfirmDeleteTestDialog from "../Components/ConfirmDeleteTestDialog.tsx";
import {UpdateTestDialog} from "../Components/UpdateTestDialog.tsx";

const Tests = () => {
    const [isAddTestDialogOpen, setIsAddTestDialogOpen] = useState(false);
    const [taskId, setTaskId] = useState<number | null>(null);
    const [sourceFile, setSourceFile] = useState<File | null>(null);

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(15);
    
    const { tests, loading, reload } = getTests(page, pageSize);
    
    const { showNotification } = useNotification();
    
    const [tasks, setTasks] = useState<Task[]>([]);


    const fetchTasks = async () => {
        try {
            const res = await api.get<Task[]>("/tasks");
            setTasks(res.data);
        } catch (err) {
            console.error(err);
            showNotification("Nepodarilo sa načítať úlohy.", "error");
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const [testToDelete, setTestToDelete] = useState<Test | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [testToUpdate, setTestToUpdate] = useState<Test | null>(null);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

    const handleDeleteTest = async () => {
        if (!testToDelete) return;
        try {
            await api.delete(`/tests/${testToDelete.id}`);
            showNotification("Test bol vymazaný", "success");
            reload();
        } catch (error) {
            console.error(error);
            showNotification("Nepodarilo sa vymazať test", "error");
        } finally {
            setDeleteDialogOpen(false);
            setTestToDelete(null);
        }
    };
    
    
    const handleAddTest = async (test: Test) =>
    {
        await api.put('/tasks/' + taskId + '/tests', test)
            .then((response: AxiosResponse<Test>) => {
                showNotification("Test bol úspešne pridaný", "success");
                reload();
                console.log(response);
            })
            .catch((error: AxiosError) => {
                console.error(error);
                showNotification("Nepodarilo sa pridať test", "error");
            });
    }

    const handleUpdateTest = async (test: Test) =>
    {
        if (testToUpdate == null) return;
        await api.post('/tasks/' + taskId + '/tests/' + testToUpdate.id, test)
            .then((response: AxiosResponse<Test>) => {
                showNotification("Test bol úspešne pridaný", "success");
                reload();
                console.log(response);
            })
            .catch((error: AxiosError) => {
                console.error(error);
                showNotification("Nepodarilo sa pridať test", "error");
            });
    }
    
    return (
        <>
            <Box p={3}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                >
                    <Typography variant="h5">Testy</Typography>
                    <Box display="flex" gap={1}>
                        <Button
                            variant="contained"
                            onClick={() => { setIsAddTestDialogOpen(true); }}
                        >
                            Pridať Test
                        </Button>
                    </Box>
                </Box>
            </Box>

            <TableContainer component={Card}>
                <Table size = "small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Názov</TableCell>
                            <TableCell>Typ</TableCell>
                            <TableCell>Povolený</TableCell>
                            <TableCell>Hodnotený</TableCell>
                            <TableCell align="right">Akcie</TableCell>
                        </TableRow>
                    </TableHead>

                    { loading ? (
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={10}>Načítavam...</TableCell>
                            </TableRow>
                        </TableBody>
                    ) : (
                        <TableBody>
                            {tests.items.map((test: Test) => (
                                <TableRow>
                                    <TableCell>{test.name}</TableCell>
                                    <TableCell>{testTypeToString(test.type)}</TableCell>
                                    <TableCell>{test.allowed ? "Áno" : "Nie"}</TableCell>
                                    <TableCell>{test.evaluate ? "Áno" : "Nie"}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Spustiť" placement="top">
                                            <IconButton onClick={() => {

                                            }}>
                                                <PlayCircleIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Nastaviť" placement="top">
                                            <IconButton onClick={() => {
                                                setTestToUpdate(test);
                                                setUpdateDialogOpen(true);
                                            }}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Vymazať" placement="top">
                                            <IconButton onClick={() => {
                                                setTestToDelete(test);
                                                setDeleteDialogOpen(true);
                                            }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    )}
                </Table>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            count={tests.totalCount}
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            rowsPerPage={pageSize}
                            onRowsPerPageChange={(e) => {
                                setPageSize(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            rowsPerPageOptions={[5, 15, 25]}
                            labelRowsPerPage="Úloh na stránku:"
                        />
                    </TableRow>
                </TableFooter>
            </TableContainer>
            
            <CreateTestDialog isOpen={isAddTestDialogOpen}
                              onClose={()=> { 
                                  setIsAddTestDialogOpen(false);
                                  reload();
                              }}
                              onSubmit={handleAddTest}
                              taskId={taskId}
                              setTaskId={setTaskId}
                              tasks={tasks}
                              sourceFile={sourceFile}
                              setSourceFile={setSourceFile}
            />


            {testToUpdate && (<UpdateTestDialog isOpen={updateDialogOpen}
                              onClose={()=> {
                                  setUpdateDialogOpen(false);
                                  setTestToUpdate(null);
                                  reload();
                              }}
                              onSubmit={handleUpdateTest}
                              taskId={taskId}
                              setTaskId={setTaskId}
                              tasks={tasks}
                              sourceFile={sourceFile}
                              setSourceFile={setSourceFile}
                              testToUpdate={testToUpdate}
            />) }

            {testToDelete && (
                <ConfirmDeleteTestDialog
                    open={deleteDialogOpen}
                    onClose={() => {
                        setDeleteDialogOpen(false);
                        setTestToDelete(null);
                    }}
                    onConfirm={handleDeleteTest}
                    testName={testToDelete.name}
                />
            )}
        </>
    );
}

export default Tests;

const getTests = (page: number, pageSize: number) => {
    const [tests, setTests] = useState<PagedResult<Test>>({ items: [], totalCount: 0 });
    const [loading, setLoading] = useState(false);

    const getTests = useCallback(async () => {
        setLoading(true);
        await api.get<PagedResult<Test>>('/tests', { params: { page: page, pageSize } })
            .then(res => {
                setTests(res.data);
            })
            .catch(e => {
                console.error(e);
            })
            .finally(() => setLoading(false));
    }, [JSON.stringify({page: page, pageSize})]);

    useEffect(() => { getTests(); }, [getTests]);

    return { tests: tests, loading, reload: getTests };
}