import React, { useState, useCallback, useRef, useEffect } from "react";
import { FaSearch, FaTimes, FaUserCircle } from "react-icons/fa";
import debounce from "lodash.debounce";
import axiosInstance from "../../../../axios/authInterceptor";
import ShimmerLoading from "./ShimmerLoading";

function SearchBar({ onUserSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Control visibility of dropdown
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been conducted

  const searchBarRef = useRef(null);

  // Debounced function for API call
  const fetchSearchResults = useCallback(
    debounce(async (query) => {
      if (query.trim()) {
        setLoading(true);
        setHasSearched(false); // Reset before new search
        try {
          const response = await axiosInstance.get(`/friends/search/`, {
            params: { q: query },
          });
          setResults(response.data.results);
          setIsOpen(true); // Open dropdown when results are fetched
        } catch (error) {
          console.error("Error fetching search results:", error);
        } finally {
          setLoading(false);
          setHasSearched(true); // Mark search as conducted after API call
        }
      } else {
        setResults([]);
        setIsOpen(false); // Close dropdown when search term is cleared
        setHasSearched(false); // Reset search state
      }
    }, 500),
    []
  );

  // Handle input change and trigger search
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchSearchResults(value);
  };

  // Clear search term but keep results
  const handleClearSearch = () => {
    setSearchTerm("");
    setIsOpen(false);
    setResults([]);
    setHasSearched(false); // Reset search state
  };

  // Close dropdown if clicked outside
  const handleClickOutside = (event) => {
    if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  // Use effect to add event listener for outside clicks
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={searchBarRef} className="relative w-96 flex items-center">
      <FaSearch className="absolute ml-2 text-gray-500" />

      {/* Input field */}
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)} // Show dropdown when focusing on input
        className="pl-8 pr-4 py-1 rounded-full border border-gray-300 w-full focus:outline-none focus:ring focus:border-blue-300"
      />

      {/* Clear search term button */}
      {searchTerm && (
        <FaTimes
          className="absolute right-3 text-gray-500 cursor-pointer"
          onClick={handleClearSearch}
        />
      )}

{(loading || (results.length > 0 && isOpen)) && (
  <div
    className={`absolute left-0 top-14 w-full bg-white shadow-lg border rounded-lg overflow-hidden transition-all duration-300 ease-in-out ${
      loading || results.length > 0 ? "max-h-96" : "max-h-0"
    }`}
    style={{ zIndex: 999 }}
  >
    {/* Display loading shimmer if loading */}
    {loading && <ShimmerLoading />}

    {/* Display results if there are any and not loading */}
    {results.length > 0 && !loading && isOpen && (
      <div className="max-h-96 10 overflow-y-auto">
        {results.map((user) => (
          <div
            key={user.id}
            className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-4"
            onClick={() => {
              onUserSelect(user);
              setIsOpen(false);
            }}
          >
            {/* User Image */}
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
            {/* Username */}
            <span className="text-gray-800 font-medium">{user.username}</span>
          </div>
        ))}
      </div>
    )}

    {/* Show 'No users found' if no results, not loading, dropdown open, and a search has been conducted */}
    {results.length === 0 && searchTerm.trim() !== "" && !loading && isOpen && hasSearched && (
      <div className="p-4">
        <span className="text-gray-500">No users found</span>
      </div>
    )}
  </div>
)}



    </div>
  );
}

export default SearchBar;
