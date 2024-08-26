import { Route, Routes } from "react-router-dom";
import UnprotectedRoutes from "./UnprotectedRoutes";
import UserRoutes from "./UserRoutes";
import Home from "../pages/Public/Home";
import Login from "../pages/Public/Login";
import About from "../pages/Public/About";
import Profile from "../pages/User/Profile";


const isAuthenticated = () => {
    return false;  
};

function PublicRoutes() {

    
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
   
            <Route path="/profile" element={<Profile />} />
        </Routes>
    );
}

export default PublicRoutes;
