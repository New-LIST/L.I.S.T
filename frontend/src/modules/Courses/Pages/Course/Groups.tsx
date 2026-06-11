import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import api from "../../../../services/api";
import { useNotification } from "../../../../shared/components/NotificationContext";
import EmptyState from "../../../../shared/components/EmptyState";
import type { CourseGroup, GroupSelection, GroupRoom } from "../../Types/CourseGroup";
import { useTranslation } from "react-i18next";

const dayKeys = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const toTimeValue = (minutes: number) => {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
};

const formatRoom = (room: GroupRoom, dayLabel: string, capacityLabel: string) =>
  `${dayLabel}, ${toTimeValue(room.timeBegin)} - ${toTimeValue(room.timeEnd)}, ${capacityLabel} ${room.capacity}`;

export default function Groups() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { showNotification } = useNotification();
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [selection, setSelection] = useState<GroupSelection | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingGroupId, setSavingGroupId] = useState<number | null>(null);
  const dateLocale = i18n.language === "en" ? "en-US" : "sk-SK";
  const getDayLabel = (day: number) => {
    const key = dayKeys[day];
    return key ? t(key) : String(day);
  };

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [groupsRes, selectionRes] = await Promise.all([
        api.get<CourseGroup[]>(`/groups/course/${id}`),
        api.get<GroupSelection>(`/groups/course/${id}/selection`),
      ]);
      setGroups(groupsRes.data);
      setSelection(selectionRes.data);
    } catch (err) {
      console.error(err);
      showNotification(t("Could not load groups"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const selectGroup = async (groupId: number) => {
    if (!id) return;
    setSavingGroupId(groupId);
    try {
      await api.patch(`/groups/course/${id}/selection`, { groupId });
      setSelection((prev) => prev ? { ...prev, selectedGroupId: groupId } : prev);
      await load();
      showNotification(t("Group changed"), "success");
    } catch (err: any) {
      showNotification(err.response?.data ?? t("Could not change group"), "error");
    } finally {
      setSavingGroupId(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <GroupsIcon />
        <Typography variant="h5">{t("Groups")}</Typography>
      </Stack>

      {selection?.groupChangeDeadline && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t("Group change allowed until")}{" "}
          {new Date(selection.groupChangeDeadline).toLocaleDateString(dateLocale)}.
        </Typography>
      )}

      {!selection?.allowed && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t("Choose group after approval")}
        </Typography>
      )}

      {groups.length === 0 ? (
        <EmptyState message={t("No groups in course")} />
      ) : (
        <Stack spacing={2}>
          {groups.map((group) => {
            const selected = selection?.selectedGroupId === group.id;
            const full = group.capacity > 0 && group.participantCount >= group.capacity && !selected;
            const disabled = !selection?.canChange || selected || full;

            return (
              <Paper key={group.id} sx={{ p: 2 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h6">{group.name}</Typography>
                    <Typography color="text.secondary">
                      {t("Occupancy")}: {group.participantCount}
                      {group.capacity > 0 ? ` / ${group.capacity}` : ` / ${t("No Limit").toLowerCase()}`}
                    </Typography>
                    {group.rooms.length > 0 && (
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        {group.rooms.map((room) => (
                          <Typography key={room.id} variant="body2" color="text.secondary">
                            {room.name}: {formatRoom(room, getDayLabel(room.timeDay), t("capacity"))}
                            {room.teachersPlan ? `, ${room.teachersPlan}` : ""}
                          </Typography>
                        ))}
                      </Stack>
                    )}
                  </Box>

                  <Button
                    variant={selected ? "outlined" : "contained"}
                    disabled={disabled || savingGroupId === group.id}
                    onClick={() => selectGroup(group.id)}
                  >
                    {selected ? t("Selected") : full ? t("Full") : t("Select")}
                  </Button>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
