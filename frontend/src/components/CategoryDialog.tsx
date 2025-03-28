import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Button } from '@mui/material';
import { Category } from '../types/Category';
import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  name: string;
  setName: (value: string) => void;
  parentId: number | null;
  setParentId: (id: number | null) => void;
  editMode: boolean;
  categories: Category[];
  excludeIds: Set<number>;
};

const flattenCategories = (
  categories: Category[],
  level = 0,
  excludeIds: Set<number> = new Set()
): { id: number; name: string }[] => {
  return categories.flatMap((category) => {
    if (excludeIds.has(category.id)) return [];

    return [
      { id: category.id, name: `${'— '.repeat(level)}${category.name}` },
      ...flattenCategories(category.children || [], level + 1, excludeIds)
    ];
  });
};

const CategoryDialog = ({
  open,
  onClose,
  onSubmit,
  name,
  setName,
  parentId,
  setParentId,
  editMode,
  categories,
  excludeIds,
}: Props) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editMode ? 'Upraviť kategóriu' : 'Pridať novú kategóriu'}
      </DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
      >
        <TextField
          label="Názov kategórie"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <TextField
          select
          label="Nadkategória (voliteľné)"
          value={parentId ?? ''}
          onChange={(e) =>
            setParentId(e.target.value ? Number(e.target.value) : null)
          }
          fullWidth
        >
          <MenuItem value="">Žiadna (hlavná kategória)</MenuItem>
          {flattenCategories(categories, 0, excludeIds).map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zrušiť</Button>
        <Button onClick={onSubmit} variant="contained">
          {editMode ? 'Uložiť zmeny' : 'Pridať'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryDialog;
