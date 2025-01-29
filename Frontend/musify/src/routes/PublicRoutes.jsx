import { Route, Routes } from "react-router-dom";
import ResetWrapper from "../Wrappers/ResetWrapper";
import Home from "../pages/Public/Home";
import Login from "../pages/Public/Login";
import Profile from "../pages/User/Profile";
import Signup from "../pages/Public/Signup";
import ForgotPassword from "../pages/Public/ForgotPassword";
import Feed from "../pages/User/Feed";
import UserWrapper from "../Wrappers/UserWrapper";
import Library from "../pages/User/Library";
import Settings from "../pages/User/Settings";
import NotFound from "../components/Public/NotFound";
import { Toaster } from "react-hot-toast";
import { ProfileProvider } from "../context/ProfileContext";
import { LoadingProvider } from "../context/LoadingContext";
import UserErrorPage from "../components/Loader/UserErrorPage";
import EditPage from "../pages/User/EditPage";
import NetworkError from "../components/Public/NetworkError";
import ChatPage from "../pages/User/ChatPage";
import NotificationProvider from "../components/Public/navbars/InnerComp.jsx/Notification/NotificationManager";
import Track from "../pages/User/Track";



function PublicRoutes() {

    
    return (

        <NotificationProvider>

        <Toaster />
        {/* <NetworkError /> */}
        
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            
            <Route
                element={
                    <ResetWrapper> 
                        <ProfileProvider>
                            <LoadingProvider>
                                <UserWrapper />
                            </LoadingProvider>
                        </ProfileProvider>
                    </ResetWrapper>
                }
            >
                <Route path="/feed" element={<Feed />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:username" element={<Profile />} />

                <Route path="/library" element={<Library />} /> 
                <Route path="/track/:id" element={<Track />}/>
                <Route path="/settings" element={<Settings />} /> 
                <Route path="/error" element={<UserErrorPage />} />
                <Route path="/chat" element={<ChatPage />} />


            </Route>

                {/* Editing page route without the header */}
                <Route
                    element={
                        <ResetWrapper>
                            <ProfileProvider>
                                <LoadingProvider>
                                    <UserWrapper includeHeader={false} />
                                </LoadingProvider>
                            </ProfileProvider>
                        </ResetWrapper>
                    }
                >
                    <Route path="/edit" element={<EditPage />} />
                </Route>



            {/* <Route element={<UserWrapper includeHeader={false} />}>
                <Route path="/some-page" element={<SomePage />} />
                <Route path="/another-page" element={<AnotherPage />} />
                </Route> */}

            <Route path="*" element={<NotFound />} /> {/* Wildcard route for 404 */}


        </Routes>
        </NotificationProvider>
    );
}

export default PublicRoutes;
