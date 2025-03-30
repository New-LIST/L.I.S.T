export type Category = {
    id: number;
    name: string;
    parentId?: number | null;
    children: Category[];
  };
  