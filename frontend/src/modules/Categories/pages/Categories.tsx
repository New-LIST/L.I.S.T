import { useEffect, useState } from 'react';
import {Container, Typography, Card, CardContent, CircularProgress, Button} from '@mui/material';
import api from '../../../services/api.ts';
import CategoryTree from '../components/CategoryTree';
import { Category } from '../types/Category';
import CategoryDialog from '../components/CategoryDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { useNotification } from "../../../shared/components/NotificationContext.tsx";


const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const { showNotification } = useNotification();
  const [nameError, setNameError] = useState<string | null>(null);


  const collectSubtreeIds = (category: Category): Set<number> => {
    const ids = new Set<number>();
    const collect = (c: Category) => {
      ids.add(c.id);
      c.children?.forEach(collect);
    };
    collect(category);
    return ids;
  };

  const resetForm = () => {
    setNameError(null);
    setOpen(false);
    setEditMode(false);
    setEditCategory(null);
    setName('');
    setParentId(null);
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
    setNameError(null);

    if (name.trim() === "") {
      setNameError("Názov kategórie nemôže byť prázdny.");
      return;
    }
    
    const request =
      editMode && editCategory
        ? api.put(`/category/${editCategory.id}`, payload)
        : api.post("/category", payload);

    request
      .then(() => {
        resetForm(); 
        fetchCategories();
        showNotification(editMode ? "Kategória bola upravená" : "Kategória bola pridaná", "success");
      })
      .catch((err) => {
        console.error(err);
        if (
          err.response &&
          err.response.status === 400 &&
          typeof err.response.data === 'string' &&
          err.response.data.includes("existuje rovnaká kategória")
        ) {
          setNameError("V tejto nadkategórii už existuje rovnaká kategória.");
        } else {
          showNotification("Nepodarilo sa uložiť kategóriu", "error");
        }
      });
  };

  const handleEdit = (category: Category) => {
    setEditMode(true);
    setEditCategory(category);
    setName(category.name);
    setParentId(category.parentId ?? null);
    setOpen(true);
  };
  
  const handleDelete = (id: number) => {
    setCategoryToDelete(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
  if (categoryToDelete !== null) {
    api.delete(`/category/${categoryToDelete}`)
      .then(() => {
        fetchCategories();
        showNotification("Kategória bola vymazaná", "success");
      })
      .catch((err) => {
        console.error(err);
        showNotification("Nepodarilo sa vymazať kategóriu", "error");
      })
      .finally(() => {
        setConfirmOpen(false);
        setCategoryToDelete(null);
      });
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
            <CategoryTree
              categories={categories}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog pre pridanie kategórie */}
      <CategoryDialog
        open={open}
        onClose={resetForm}
        onSubmit={handleSubmit}
        name={name}
        setName={setName}
        parentId={parentId}
        setParentId={setParentId}
        editMode={editMode}
        categories={categories}
        excludeIds={editCategory ? collectSubtreeIds(editCategory) : new Set()}
        nameError={nameError}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Potvrdenie vymazania"
        message="Naozaj chceš vymazať túto kategóriu?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </Container>
  );
};

export default Categories;
