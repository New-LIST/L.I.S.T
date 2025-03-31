// modules/Application/config/menuConfigByRole.tsx
import Courses from '../../Courses/Pages/Courses.tsx';
import Periods from '../../Periods/Pages/Periods.tsx';
import Categories from '../../Categories/pages/Categories.tsx';
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
    ],
    assistant: [
        { label: 'Kurzy', path: 'courses', element: <Courses /> },
        { label: 'Obdobia', path: 'periods', element: <Periods /> }
    ],

};
