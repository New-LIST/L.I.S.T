import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { ExpandMore, ChevronRight, Edit, Delete} from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import { Category } from '../types/Category';


type Props = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
};


const CategoryTree = ({ categories, onEdit, onDelete }: Props) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const renderTree = (category: Category) => (
    <TreeItem
      key={category.id}
      itemId={category.id.toString()}
      label={
        <Box
          onMouseEnter={() => setHoveredId(category.id)}
          onMouseLeave={() => setHoveredId(null)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography>{category.name}</Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              minWidth: 60, // rezervuj šírku
              justifyContent: "flex-end",
              visibility: hoveredId === category.id ? "visible" : "hidden",
            }}
          >
            <IconButton size="small" onClick={() => onEdit(category)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(category.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      }
    >
      {category.children?.map(renderTree)}
    </TreeItem>
  );
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

export default CategoryTree;
