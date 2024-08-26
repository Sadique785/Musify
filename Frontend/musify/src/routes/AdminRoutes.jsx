import { Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/Admin/Dashboard';
import ManageUsers from '../pages/Admin/ManageUsers';

function AdminRoutes() {
    return (
        <Routes>
            <Route path='/admin-dashboard' element={<Dashboard/>} />
            <Route path='/manage-users' element={<ManageUsers/>} />
        </Routes>
    )
}

export default AdminRoutes;