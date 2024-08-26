import { Route, Routes } from "react-router-dom";
import Home from "../pages/Public/Home";
import Login from "../pages/Public/Login";
import About from "../pages/Public/About";

function UnprotectedRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
        </Routes>
    );
}

export default UnprotectedRoutes;
