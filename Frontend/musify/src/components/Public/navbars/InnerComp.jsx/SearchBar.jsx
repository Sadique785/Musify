import React, { useState, useCallback, useRef, useEffect } from "react";
import { FaSearch, FaTimes, FaUserCircle } from "react-icons/fa";
import debounce from "lodash.debounce";
import axiosInstance from "../../../../axios/authInterceptor";
import ShimmerLoading from "./ShimmerLoading";

function SearchBar({ onUserSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchBarRef = useRef(null);

  const fetchSearchResults = useCallback(
    debounce(async (query) => {
      if (query.trim()) {
        setLoading(true);
        setHasSearched(false);
        try {
          const response = await axiosInstance.get(`/friends/search/`, {
            params: { q: query },
          });
          // Ensure results is always an array
          setResults(response.data?.results || []);
          setIsOpen(true);
        } catch (error) {
          setResults([]);
        } finally {
          setLoading(false);
          setHasSearched(true);
        }
      } else {
        setResults([]);
        setIsOpen(false);
        setHasSearched(false);
      }
    }, 500),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchSearchResults(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setIsOpen(false);
    setResults([]);
    setHasSearched(false);
  };

  const handleClickOutside = (event) => {
    if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={searchBarRef} className="relative w-96 flex items-center">
      <FaSearch className="absolute ml-2 text-gray-500" />

      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        className="pl-8 pr-4 py-1 rounded-full border border-gray-300 w-full focus:outline-none focus:ring focus:border-blue-300"
      />

      {searchTerm && (
        <FaTimes
          className="absolute right-3 text-gray-500 cursor-pointer"
          onClick={handleClearSearch}
        />
      )}

      {(loading || isOpen) && (
        <div
          className="absolute left-0 top-14 w-full bg-white shadow-lg border rounded-lg overflow-hidden transition-all duration-300 ease-in-out"
          style={{ zIndex: 999 }}
        >
          {loading && <ShimmerLoading />}

          {!loading && results.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {results.map((user) => (
                <div
                  key={user.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-4"
                  onClick={() => {
                    onUserSelect(user);
                    setIsOpen(false);
                  }}
                >
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="text-gray-500 w-8 h-8" />
                    )}
                  </div>
                  <span className="text-gray-800 font-medium">
                    {user.username}
                  </span>
                </div>
              ))}
            </div>
          )}

          {!loading && hasSearched && searchTerm.trim() !== "" && results.length === 0 && (
            <div className="p-4 text-center">
              <span className="text-gray-500">No users found</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;