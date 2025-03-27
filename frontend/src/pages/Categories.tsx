import { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import api from '../services/api';
import CategoryTree from '../components/CategoryTree';

type Category = {
  id: number;
  name: string;
  children: Category[];
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Category[]>('/category')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>Kategórie</Typography>
      <Card>
        <CardContent>
          {loading ? <CircularProgress /> : <CategoryTree categories={categories} />}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Categories;
