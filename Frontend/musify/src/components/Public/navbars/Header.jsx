import React from "react";
import { useState, useEffect } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { Menu, X } from 'lucide-react';


function Header({ className }) {

    const [scrolled,setScrolled] = useState(false);
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };
  


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
        <div className="container flex mx-auto justify-between items-center relative">
          <Link to={'/'}>
            <div className="flex items-center space-x-2">
              <img src={'/logo/logo.png'} alt="logo" className="h-10 w-10 mr-3"/>
              <h1 className="text-3xl font-bold text-gradient">Musify</h1>
            </div>
          </Link>
  
          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
  
          {/* Desktop and Mobile Dropdown Menu */}
          <nav className={`
            ${isMenuOpen ? 'flex' : 'hidden md:flex'}
            absolute md:static top-full left-0 right-0 
            md:items-center md:space-x-9 
            bg-[#050404] md:bg-transparent 
            flex-col md:flex-row 
            items-center 
            space-y-4 md:space-y-0 
            p-4 md:p-0 
            shadow-lg md:shadow-none
            rounded-lg
            
          `}>
            <ul className="flex flex-col md:flex-row items-center md:space-x-4 space-y-4 md:space-y-0 w-full md:w-auto">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `font-semibold text-white hover:text-gray-400 w-full text-center md:w-auto ${
                    isActive ? "border-b-2 border-white" : ""
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `font-semibold text-white hover:text-gray-400 w-full text-center md:w-auto ${
                    isActive ? "border-b-2 border-white" : ""
                  }`
                }
              >
                Login
              </NavLink>
            </ul>
  
            <Link to={'/register'} className="w-full md:w-auto">
              <button
                className={`
                  ${
                    isAuthPage 
                      ? "bg-gray-100 text-black hover:bg-gray-400" 
                      : (scrolled ? "bg-white text-black hover:bg-gray-400" : "bg-black text-white hover:bg-gray-900")
                  } 
                  font-semibold px-4 py-2 rounded-full transition duration-200 w-full md:w-auto
                `}
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
