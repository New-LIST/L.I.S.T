import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, Tab, Box } from "@mui/material";
import AssignmentFormInfo from "./AssignmentFormInfo";
import AssignmentFormTasks from "./AssignmentFormTasks";
import AssignmentPreview from "./AssignmentPreview";
import { Assignment } from "../types/Assignment";
import { useNotification } from "../../../shared/components/NotificationContext";


type Props = {
  assignment?: Assignment;
};

const AssignmentFormTabs = ({ assignment }: Props) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState(0);
  const [assignmentId, setAssignmentId] = useState<number | null>(
    assignment?.id ?? null
  );

  // keď sa načíta defaultValues (pri editácii), nastavíme ID
  useEffect(() => {
    if (assignment?.id) {
      setAssignmentId(assignment.id);
    }
  }, [assignment]);

  // handler pre vytvorenie nového assignmentu
  const handleCreated = (id: number) => {
    setAssignmentId(id);
    // presmerovanie na edit page, kde máme assignment/:id /dash/assignments/create
    navigate(`/dash/assignments/edit/${id}`);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (assignmentId === null && newValue > 0) {
      showNotification("Najprv ulož základné informácie", "warning");
      return;
    }
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Tabs value={activeTab} onChange={handleTabChange} centered>
        <Tab label="Info" />
        <Tab label="Úlohy" />
        <Tab label="Prehľad" />
      </Tabs>

      <Box mt={3}>
        {activeTab === 0 && (
          <AssignmentFormInfo
            onCreated={handleCreated}
            defaultValues={assignment}
          />
        )}
        {activeTab === 1 && assignmentId !== null && (
          <AssignmentFormTasks assignmentId={assignmentId} />
        )}
        {activeTab === 2 && assignmentId !== null && (
          <AssignmentPreview assignmentId={assignmentId} />
        )}
      </Box>
    </Box>
  );
};

export default AssignmentFormTabs;
