import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import api from "../../../services/api";
import { useNotification } from "../../../shared/components/NotificationContext";
import type { CourseGroup, GroupRoom } from "../Types/CourseGroup";
import { useTranslation } from "react-i18next";

const days = [
  { value: 1, labelKey: "Monday" },
  { value: 2, labelKey: "Tuesday" },
  { value: 3, labelKey: "Wednesday" },
  { value: 4, labelKey: "Thursday" },
  { value: 5, labelKey: "Friday" },
  { value: 6, labelKey: "Saturday" },
  { value: 7, labelKey: "Sunday" },
];

const toTimeValue = (minutes: number) => {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
};

const fromTimeValue = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatTimeRange = (room: GroupRoom, dayLabel: string) =>
  `${dayLabel}, ${toTimeValue(room.timeBegin)} - ${toTimeValue(room.timeEnd)}`;

export default function CourseGroups() {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const courseName = location.state?.courseName ?? "";
  const periodName = location.state?.periodName ?? "";
  const { showNotification } = useNotification();

  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CourseGroup | null>(null);
  const [groupName, setGroupName] = useState("");

  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [roomGroupId, setRoomGroupId] = useState<number | null>(null);
  const [editingRoom, setEditingRoom] = useState<GroupRoom | null>(null);
  const [roomName, setRoomName] = useState("");
  const [timeDay, setTimeDay] = useState(1);
  const [timeBegin, setTimeBegin] = useState("08:00");
  const [timeEnd, setTimeEnd] = useState("10:00");
  const [roomCapacity, setRoomCapacity] = useState(0);
  const [teachersPlan, setTeachersPlan] = useState("");

  const getDayLabel = (day: number) => {
    const key = days.find((d) => d.value === day)?.labelKey;
    return key ? t(key) : String(day);
  };

  const fetchGroups = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get<CourseGroup[]>(`/groups/course/${id}`);
      setGroups(res.data);
    } catch (err) {
      console.error(err);
      showNotification(t("Could not load groups"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [id]);

  const resetGroupDialog = () => {
    setEditingGroup(null);
    setGroupName("");
    setGroupDialogOpen(false);
  };

  const resetRoomDialog = () => {
    setRoomGroupId(null);
    setEditingRoom(null);
    setRoomName("");
    setTimeDay(1);
    setTimeBegin("08:00");
    setTimeEnd("10:00");
    setRoomCapacity(0);
    setTeachersPlan("");
    setRoomDialogOpen(false);
  };

  const openGroupDialog = (group?: CourseGroup) => {
    setEditingGroup(group ?? null);
    setGroupName(group?.name ?? "");
    setGroupDialogOpen(true);
  };

  const openRoomDialog = (groupId: number, room?: GroupRoom) => {
    setRoomGroupId(groupId);
    setEditingRoom(room ?? null);
    setRoomName(room?.name ?? "");
    setTimeDay(room?.timeDay ?? 1);
    setTimeBegin(room ? toTimeValue(room.timeBegin) : "08:00");
    setTimeEnd(room ? toTimeValue(room.timeEnd) : "10:00");
    setRoomCapacity(room?.capacity ?? 0);
    setTeachersPlan(room?.teachersPlan ?? "");
    setRoomDialogOpen(true);
  };

  const saveGroup = async () => {
    if (!id) return;
    const payload = { name: groupName.trim(), courseId: Number(id) };
    try {
      if (editingGroup) {
        await api.put(`/groups/${editingGroup.id}`, { name: payload.name });
        showNotification(t("Group updated"), "success");
      } else {
        await api.post("/groups", payload);
        showNotification(t("Group created"), "success");
      }
      resetGroupDialog();
      fetchGroups();
    } catch (err: any) {
      showNotification(err.response?.data ?? t("Could not save group"), "error");
    }
  };

  const deleteGroup = async (group: CourseGroup) => {
    if (!window.confirm(t("Delete Group Confirm", { name: group.name }))) return;
    try {
      await api.delete(`/groups/${group.id}`);
      showNotification(t("Group deleted"), "success");
      fetchGroups();
    } catch (err: any) {
      showNotification(err.response?.data ?? t("Could not delete group"), "error");
    }
  };

  const saveRoom = async () => {
    if (!roomGroupId) return;
    const payload = {
      name: roomName.trim(),
      timeBegin: fromTimeValue(timeBegin),
      timeEnd: fromTimeValue(timeEnd),
      timeDay,
      capacity: roomCapacity,
      teachersPlan: teachersPlan.trim() || null,
    };

    try {
      if (editingRoom) {
        await api.put(`/groups/rooms/${editingRoom.id}`, payload);
        showNotification(t("Room updated"), "success");
      } else {
        await api.post(`/groups/${roomGroupId}/rooms`, payload);
        showNotification(t("Room added"), "success");
      }
      resetRoomDialog();
      fetchGroups();
    } catch (err: any) {
      showNotification(err.response?.data ?? t("Could not save room"), "error");
    }
  };

  const deleteRoom = async (room: GroupRoom) => {
    if (!window.confirm(t("Delete Room Confirm", { name: room.name }))) return;
    try {
      await api.delete(`/groups/rooms/${room.id}`);
      showNotification(t("Room deleted"), "success");
      fetchGroups();
    } catch (err: any) {
      showNotification(err.response?.data ?? t("Could not delete room"), "error");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4">{t("Course Groups")}</Typography>
          <Typography color="text.secondary">
            {courseName} {periodName && `(${periodName})`}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openGroupDialog()}>
          {t("Add Group")}
        </Button>
      </Stack>

      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("Name")}</TableCell>
                <TableCell>{t("Occupancy")}</TableCell>
                <TableCell>{t("Rooms")}</TableCell>
                <TableCell align="right">{t("Actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{group.name}</TableCell>
                  <TableCell>
                    {group.participantCount}
                    {group.capacity > 0 ? ` / ${group.capacity}` : ` / ${t("No Limit").toLowerCase()}`}
                  </TableCell>
                  <TableCell>
                    {group.rooms.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        {t("No Rooms")}
                      </Typography>
                    ) : (
                      <Stack spacing={0.5}>
                        {group.rooms.map((room) => (
                          <Box key={room.id} display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">
                              {room.name}: {formatTimeRange(room, getDayLabel(room.timeDay))}, {t("capacity")} {room.capacity}
                              {room.teachersPlan ? `, ${room.teachersPlan}` : ""}
                            </Typography>
                            <Tooltip title={t("Edit Room")}>
                              <IconButton size="small" onClick={() => openRoomDialog(group.id, room)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t("Delete Room")}>
                              <IconButton size="small" onClick={() => deleteRoom(room)}>
                                <DeleteIcon fontSize="small" color="error" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t("Add Room")}>
                      <IconButton onClick={() => openRoomDialog(group.id)}>
                        <MeetingRoomIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("Edit Group")}>
                      <IconButton onClick={() => openGroupDialog(group)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("Delete Group")}>
                      <IconButton onClick={() => deleteGroup(group)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {groups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    {t("No Groups Created")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={groupDialogOpen} onClose={resetGroupDialog} fullWidth maxWidth="xs">
        <DialogTitle>{editingGroup ? t("Edit Group") : t("New Group")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label={t("Group Name")}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={resetGroupDialog}>{t("Cancel")}</Button>
          <Button variant="contained" onClick={saveGroup} disabled={!groupName.trim()}>
            {t("Save")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={roomDialogOpen} onClose={resetRoomDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingRoom ? t("Edit Room") : t("New Room")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t("Room Name")}
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <TextField
              select
              label={t("Day")}
              value={timeDay}
              onChange={(e) => setTimeDay(Number(e.target.value))}
            >
              {days.map((day) => (
                <MenuItem key={day.value} value={day.value}>
                  {t(day.labelKey)}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                type="time"
                label={t("Start")}
                value={timeBegin}
                onChange={(e) => setTimeBegin(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="time"
                label={t("End")}
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <TextField
              type="number"
              label={t("Capacity")}
              value={roomCapacity}
              onChange={(e) => setRoomCapacity(Number(e.target.value))}
              inputProps={{ min: 1 }}
            />
            <TextField
              label={t("Teachers / Note")}
              value={teachersPlan}
              onChange={(e) => setTeachersPlan(e.target.value)}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetRoomDialog}>{t("Cancel")}</Button>
          <Button
            variant="contained"
            onClick={saveRoom}
            disabled={!roomName.trim() || roomCapacity <= 0 || fromTimeValue(timeBegin) >= fromTimeValue(timeEnd)}
          >
            {t("Save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
