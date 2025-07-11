// FO Joint Box routes (matches fo-odcs/routes.tsx blueprint)
import { Route } from 'react-router';
import Index from './index/FoJointBoxes';
import Create from './create/Create';
import Edit from './edit/Edit';
import Show from './show/Show';

export const foJointBoxRoutes = [
    <Route key="fo-joint-boxes-index" path="/fo-joint-boxes" element={<Index />} />,
    <Route key="fo-joint-boxes-create" path="/fo-joint-boxes/create" element={<Create />} />,
    <Route key="fo-joint-boxes-edit" path="/fo-joint-boxes/:id/edit" element={<Edit />} />,
    <Route key="fo-joint-boxes-show" path="/fo-joint-boxes/:id" element={<Show />} />,
];

