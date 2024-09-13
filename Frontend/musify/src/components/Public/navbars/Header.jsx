import React from "react";
import { useState, useEffect } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";

function Header({ className }) {

    const [scrolled,setScrolled] = useState(false);
    const location = useLocation();


    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 20){
                setScrolled(true);

            }
            else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
                window.removeEventListener("scroll", handleScroll)
        };
    }, []);

    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
    


    return (
      <header
      className={`${scrolled ? "bg-black" : "bg-[#731C1B]"} ${
        className || ""
      } fixed w-full transition duration-200 p-6 z-50`}
    >
            <div className="container flex mx-auto justify-between items-center">
            <Link to={'/'} >
            <div className="flex items-center space-x-2">
                <img src={'/logo/logo.png'} alt="logo" className="h-10 w-10 mr-3"/>
                <h1 className="text-3xl font-bold text-gradient">Musify</h1>
                </div>
            </Link>
                <nav className="flex items-center space-x-9">
                    <ul className="flex items-center space-x-4">
                    <NavLink
              to="/"
              className={({ isActive }) =>
                `font-semibold text-white hover:text-gray-400 ${
                  isActive ? "border-b-2 border-white" : ""
                }`
              }
            >
              Home
            </NavLink>
            <NavLink 
            to="/about"
            className={({ isActive }) =>
            `font-semibold text-white hover:text-gray-400 ${isActive ? "border-b-2 border-white": ""}`}
            >
                Master
            </NavLink>

            <NavLink
              to="/login"
              className={({ isActive }) =>
                `font-semibold text-white hover:text-gray-400 ${
                  isActive ? "border-b-2 border-white" : ""
                }`
              }
            >
              Login
            </NavLink>

                    </ul>

                    <Link to={'/register'}>
                    <button
                      className={`${
                        isAuthPage 
                          ? "bg-gray-100 text-black hover:bg-gray-400" 
                          : (scrolled ? "bg-white text-black hover:bg-gray-400" : "bg-black text-white hover:bg-gray-900")
                      } font-semibold px-4 py-2 rounded-full transition duration-200`}
                    >
                      Sign up
                    </button>
                  </Link>

                </nav>
            </div>
        </header>
    );
}

export default Header;
