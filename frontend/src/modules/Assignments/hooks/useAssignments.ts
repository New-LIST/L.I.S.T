// Assignments/hooks/useAssignments.ts
import { useEffect, useState, useCallback } from "react";
import { Assignment } from "../types/Assignment";
import { PagedResult } from "../../../shared/Interfaces/PagedResult";
import api from "../../../services/api";

export const useAssignments = (filters: {
  page: number;
  pageSize: number;
  sort?: string;
  desc?: boolean;
  userId?: number;
  name?: string;
  courseId?: number;
}) => {
  const [data, setData] = useState<PagedResult<Assignment>>({ items: [], totalCount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    api.get<PagedResult<Assignment>>("/assignments/filter", { params: filters })
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
};
