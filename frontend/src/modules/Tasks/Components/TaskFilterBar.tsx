import { Box, Button, IconButton, TextField, Typography, Autocomplete} from '@mui/material';
import { useEffect, useState } from 'react';
import { Category } from '../../Categories/types/Category'
import api from '../../../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import { CategoryFilterBlock } from '../Types/CategoryFilterBlock';

type Props = {
  onFilterChange: (filters: {
    name: string;
    author: string;
    categoryBlocks: CategoryFilterBlock[];
  }) => void;
};

const TaskFilterBar = ({ onFilterChange }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [blocks, setBlocks] = useState<CategoryFilterBlock[]>([{ include: [], exclude: [] }]);

  const fetchCategories = async () => {
    const res = await api.get('/category');
    const flat = flattenCategories(res.data);
    setCategories(flat);

  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = () => {
    onFilterChange({ name, author, categoryBlocks: blocks });
  };

  const flattenCategories = (categories: Category[]): Category[] => {
    const result: Category[] = [];
  
    const traverse = (catList: Category[]) => {
      for (const cat of catList) {
        result.push(cat);
        if (cat.children && cat.children.length > 0) {
          traverse(cat.children);
        }
      }
    };
  
    traverse(categories);
    return result;
  };



  return (
    <Box mb={3} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h6">Filter</Typography>
      <Box display="flex" gap={2} flexWrap="wrap">
        <TextField
          label="Názov"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Autor"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </Box>
      <Box>
        {blocks.map((block, idx) => (
          <Box key={idx} display="flex" gap={2} alignItems="center" mb={1}>
            <Autocomplete
              multiple
              options={categories}
              getOptionLabel={(c) => c.name}
              value={categories.filter((c) => block.include.includes(c.id))}
              onChange={(_, val) => {
                const newBlocks = [...blocks];
                newBlocks[idx].include = val.map((v) => v.id);
                setBlocks(newBlocks);
              }}
              renderInput={(params) => (
                <TextField {...params} label="AND kategórie" />
              )}
              sx={{ minWidth: 200 }}
            />
            <Autocomplete
              multiple
              options={categories}
              getOptionLabel={(c) => c.name}
              value={categories.filter((c) => block.exclude.includes(c.id))}
              onChange={(_, val) => {
                const newBlocks = [...blocks];
                newBlocks[idx].exclude = val.map((v) => v.id);
                setBlocks(newBlocks);
              }}
              renderInput={(params) => (
                <TextField {...params} label="NOT kategórie" />
              )}
              sx={{ minWidth: 200 }}
            />
            <IconButton
              onClick={() => setBlocks(blocks.filter((_, i) => i !== idx))}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button
          onClick={() => setBlocks([...blocks, { include: [], exclude: [] }])}
        >
          Pridať OR blok
        </Button>
      </Box>
      <Button variant="contained" onClick={handleChange} sx={{ mt: 2 }}>
        Použiť filter
      </Button>
    </Box>
  );
};

export default TaskFilterBar;
