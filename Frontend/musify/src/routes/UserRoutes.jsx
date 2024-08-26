import { Routes, Route } from "react-router-dom";
import Home from "../pages/User/Home";
import Profile from "../pages/User/Profile";

function UserRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
        </Routes>
    );
}

export default UserRoutes;
