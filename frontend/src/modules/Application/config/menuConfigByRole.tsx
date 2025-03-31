// modules/Application/config/menuConfigByRole.tsx
import Courses from '../../Courses/Pages/Courses.tsx';
import Periods from '../../Periods/Pages/Periods.tsx';
import Categories from '../../Categories/pages/Categories.tsx';
import Users from '../../Users/pages/Users.tsx'
import { ReactElement } from 'react';

export type MenuItem = {
    label: string;
    path: string;
    element: ReactElement;
};

export const menuConfigByRole: Record<string, MenuItem[]> = {
    student: [
        { label: 'Kurzy', path: 'courses', element: <Courses /> },
    ],
    teacher: [
        { label: 'Kurzy', path: 'courses', element: <Courses /> },
        { label: 'Obdobia', path: 'periods', element: <Periods /> },
        { label: 'Kategórie', path: 'categories', element: <Categories /> },
        { label: 'Pouzivatelov', path: 'users', element: <Users /> }
    ],
    assistant: [
        { label: 'Kurzy', path: 'courses', element: <Courses /> },
        { label: 'Obdobia', path: 'periods', element: <Periods /> }
    ],

};
