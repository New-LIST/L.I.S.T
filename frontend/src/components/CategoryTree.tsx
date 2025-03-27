import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { ExpandMore, ChevronRight} from '@mui/icons-material';

type Category = {
  id: number;
  name: string;
  children?: Category[];
};

type Props = {
  categories: Category[];
};

const renderTree = (category: Category) => (
  <TreeItem
    key={category.id}
    itemId={category.id.toString()}
    label={category.name}
  >
    {category.children?.map((child) => renderTree(child))}
  </TreeItem>
);

const CategoryTree = ({ categories }: Props) => {
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
