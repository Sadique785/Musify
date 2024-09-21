import { Route, Routes } from "react-router-dom";
import ResetWrapper from "../Wrappers/ResetWrapper";
import Home from "../pages/Public/Home";
import Login from "../pages/Public/Login";
import About from "../pages/Public/About";
import Profile from "../pages/User/Profile";
import Signup from "../pages/Public/Signup";
import ForgotPassword from "../pages/Public/ForgotPassword";
import Feed from "../pages/User/Feed";
import UserWrapper from "../Wrappers/UserWrapper";
import Explore from "../pages/User/Explore";
import Library from "../pages/User/Library";
import Settings from "../pages/User/Settings";
import NotFound from "../components/Public/NotFound";
import { Toaster } from "react-hot-toast";






function PublicRoutes() {

    
    return (

        <>
        <Toaster />
        
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            
            <Route element={<ResetWrapper> 
                             <UserWrapper />
                           </ResetWrapper>}
            >
                <Route path="/feed" element={<Feed />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/explore" element={<Explore />} /> 
                <Route path="/library" element={<Library />} /> 
                <Route path="/settings" element={<Settings />} /> 
            </Route>


            {/* <Route element={<UserWrapper includeHeader={false} />}>
                <Route path="/some-page" element={<SomePage />} />
                <Route path="/another-page" element={<AnotherPage />} />
                </Route> */}

            <Route path="*" element={<NotFound />} /> {/* Wildcard route for 404 */}


        </Routes>
                </>
    );
}

export default PublicRoutes;
