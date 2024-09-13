import { Routes, Route } from "react-router-dom";
import Home from "../pages/User/Feed";
import Profile from "../pages/User/Profile";

function UserRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
        </Routes>
    );
}

export default UserRoutes;
