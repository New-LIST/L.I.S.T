import { Typography } from "@mui/material";
import LogsTable from "../Components/LogsTable";

export default function LogsPage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Activity Logs
      </Typography>
      <LogsTable />
    </>
  );
}
