import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminRoutes from './routes/AdminRoutes';
import PublicRoutes from './routes/PublicRoutes';

import './App.css';

function App() {
    return (

            <Router>
                <Routes>
                    {/* Public and User Routes */}
                    <Route path="/*" element={<PublicRoutes />} />

                    {/* Admin Routes */}
                    <Route path="/admin/*" element={<AdminRoutes />} />
                </Routes>
            </Router>
    );
}

export default App;
