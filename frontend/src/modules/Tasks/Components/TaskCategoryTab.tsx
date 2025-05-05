import { useEffect, useState } from 'react';
import { Checkbox, CircularProgress, Typography, Box } from '@mui/material';
import { Category } from '../../Categories/types/Category'
import api from '../../../services/api';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { ExpandMore, ChevronRight } from '@mui/icons-material';

type Props = {
  taskId: number;
};

const TaskCategoryTab = ({ taskId }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [cats, assigned] = await Promise.all([
      api.get<Category[]>('/category'),
      api.get<number[]>(`/tasks/task-category/by-task/${taskId}`)
    ]);
    setCategories(cats.data);
    setSelectedIds(assigned.data);
    setLoading(false);
  };

  const toggleCategory = async (categoryId: number, checked: boolean) => {
    if (checked) {
      await api.post(`/tasks/task-category?taskId=${taskId}&categoryId=${categoryId}`);
      setSelectedIds([...selectedIds, categoryId]);
    } else {
      await api.delete(`/tasks/task-category?taskId=${taskId}&categoryId=${categoryId}`);
      setSelectedIds(selectedIds.filter(id => id !== categoryId));
    }
  };

  const renderTree = (category: Category) => (
    <TreeItem
      key={category.id}
      itemId={category.id.toString()}
      label={
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
        <Typography>{category.name}</Typography>
        <Checkbox
          checked={selectedIds.includes(category.id)}
          onClick={(e) => e.stopPropagation()} // zabráni expandu
          onChange={(e) => toggleCategory(category.id, e.target.checked)}
        />
      </Box>
      }
    >
      {category.children?.map(renderTree)}
    </TreeItem>
  );

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <SimpleTreeView
      slots={{
        expandIcon: ExpandMore,
        collapseIcon: ChevronRight
      }}
    >
      {categories.map(renderTree)}
    </SimpleTreeView>
  );
};

export default TaskCategoryTab;
