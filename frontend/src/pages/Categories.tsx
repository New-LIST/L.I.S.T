import { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, CircularProgress,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem
} from '@mui/material';
import api from '../services/api';
import CategoryTree from '../components/CategoryTree';
import { Category } from '../types/Category';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const collectSubtreeIds = (category: Category): Set<number> => {
    const ids = new Set<number>();
    const collect = (c: Category) => {
      ids.add(c.id);
      c.children?.forEach(collect);
    };
    collect(category);
    return ids;
  };
  

  const flattenCategories = (
    categories: Category[],
    level = 0,
    excludeBranchIds: Set<number> = new Set()
  ): { id: number; name: string }[] => {
    return categories.flatMap((category) => {
      if (excludeBranchIds.has(category.id)) return [];

      return [
        { id: category.id, name: `${"— ".repeat(level)}${category.name}` },
        ...flattenCategories(
          category.children || [],
          level + 1,
          excludeBranchIds
        ),
      ];
    });
  };

  
  const fetchCategories = () => {
    setLoading(true);
    api.get<Category[]>('/category')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = () => {
    const payload = { name, parentId };

    const request =
      editMode && editCategory
        ? api.put(`/category/${editCategory.id}`, payload)
        : api.post("/category", payload);

    request
      .then(() => {
        setOpen(false);
        setEditMode(false);
        setEditCategory(null);
        setName("");
        setParentId(null);
        fetchCategories();
      })
      .catch((err) => console.error(err));
  };

  const handleEdit = (category: Category) => {
    setEditMode(true);
    setEditCategory(category);
    setName(category.name);
    setParentId(category.parentId ?? null);
    setOpen(true);
  };
  
  const handleDelete = (id: number) => {
    if (window.confirm("Naozaj chceš vymazať túto kategóriu?")) {
      api.delete(`/category/${id}`)
        .then(fetchCategories)
        .catch(err => console.error(err));
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Kategórie
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Pridať kategóriu
      </Button>

      <Card>
        <CardContent>
          {loading ? (
            <CircularProgress />
          ) : (
            <CategoryTree categories={categories} onEdit={handleEdit}
            onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>

      {/* Dialog pre pridanie kategórie */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editMode ? "Upraviť kategóriu" : "Pridať novú kategóriu"}</DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
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
            value={parentId ?? ""}
            onChange={(e) =>
              setParentId(e.target.value ? Number(e.target.value) : null)
            }
            fullWidth
          >
            <MenuItem value="">Žiadna (hlavná kategória)</MenuItem>
            {flattenCategories(categories, 0, editCategory ? collectSubtreeIds(editCategory) : new Set<number>()).map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setOpen(false); setEditMode(false); setEditCategory(null);}}>Zrušiť</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? "Uložiť zmeny" : "Pridať"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Categories;
