import React, { useState } from "react";
import Header from "../../components/Public/navbars/Header";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import toast from 'react-hot-toast'

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [otp, setOtp] = useState("");
    const [responseSuccess, setResponseSuccess] = useState(false);
    const [otpError, setotpError] = useState("");

    const navigate = useNavigate()

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    console.log(backendUrl);

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setUsernameError("");
        setEmailError("");
        setPasswordError("");

        if (username.trim() === "") {
            setUsernameError("Username is required.");

            return;
        }

        if (email.trim() === "") {
            setEmailError("Email is required.");

            return;
        }

        if (password.trim() === "") {
            setPasswordError("Password is required.");

            return;
        }
        if (password.length < 6) {
            setPasswordError("Atleast 6 characters are required");

            return;
        }

        try {
            const response = await axios.post(`${backendUrl}/auth/register/`, {
                username,
                email,
                password,
            },{ withCredentials: true });

            if (response.status === 201) {
                console.log("Success:", response.data.message);
                setResponseSuccess(true);
            }
        } catch (error) {
          if (error.response) {
              const errors = error.response.data.message;
  
              errors.forEach((errorMessage) => {
                  if (errorMessage.toLowerCase().includes("email")) {
                      setEmailError(errorMessage);
                      console.log(errorMessage);
                       
                  } else if (errorMessage.toLowerCase().includes("username")) {
                      setUsernameError(errorMessage); 
                  } else if (errorMessage.toLowerCase().includes("password")) {
                      setPasswordError(errorMessage); 
                  } else {
                      console.error("Error response:", errors);
                  }
              });
          } else if (error.request) {
              console.error("Error Request :", error.request);
          } else {
              console.log("Error message:", error.message);
          }
      }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setotpError('')

        if (otp.trim() === "") {
          setotpError("OTP must not be empty or spaces.");
          return;
      }
  
      if (otp.length !== 6) {
          setotpError("OTP length must be 6.");
          return;
      }
  
      if (!/^\d+$/.test(otp)) {
          setotpError("OTP must contain only digits.");
          return;
      }

        try {
            const response = await axios.post(`${backendUrl}/auth/verify-otp/`, { email, otp }, { withCredentials: true });

            if (response.status === 200) {
                
                toast.success("OTP verified . You can login now!");
                navigate('/login')
            }
        } catch (error) {
            setotpError(error.response?.data?.message || "invalid OTP, please try again");
        }
    };

    return (
        <div className="relative h-screen ">
            <Header className="bg-transparent" />
            
                          <div
                          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                          style={{ backgroundImage: "url(cover/musical_legends.png)" }}
                      >
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
                          <div className="relative z-10 flex items-center justify-center h-full  ">


                          {!responseSuccess ? (
                              <form onSubmit={handleSubmit} className="mt-6 bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                                  <div className="flex items-center justify-center mb-6">
                                      <span className="text-gray-700 text-2xl font-bold">Create An Account</span>
                                  </div>
          
                                  {/* Username Field */}
                                  <div className="mb-4">
                                      <label htmlFor="username" className="block text-left text-gray-700 font-semibold mb-2">
                                          Username
                                      </label>
                                      <input
                                          type="text"
                                          id="username"
                                          name="username"
                                          value={username}
                                          onChange={(e) => {
                                            setUsername(e.target.value);
                                            if (e.target.value.trim() !== ''){
                                              setUsernameError('');
                                            }
                                          }}
                                          placeholder="Username"
                                          className="w-full p-3 border h-[45px] bg-gray-100 border-gray-100 rounded focus:outline-none focus:border-gray-200"
                                      />
                                      {usernameError && <p className="text-red-500 text-sm font-medium mt-1">{usernameError}</p>}
                                  </div>
          
                                  <div className="mb-4">
                                      <label htmlFor="email" className="block text-left text-gray-700 font-semibold mb-2">
                                          Email
                                      </label>
                                      <input
                                          type="email"
                                          id="email"
                                          name="email"
                                          value={email}
                                          onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (e.target.value.trim() !== ''){
                                              setEmailError('');
                                            }
                                          }}
                                          placeholder="Email"
                                          className="w-full p-3 border h-[45px] bg-gray-100 border-gray-100 rounded focus:outline-none focus:border-gray-200"
                                      />
                                      {emailError && <p className="text-red-500 text-sm font-medium mt-1">{emailError}</p>}
                                  </div>
          
                                  <div className="mb-4 relative">
                                      <label htmlFor="password" className="block text-left text-gray-700 font-semibold mb-2">
                                          Password
                                      </label>
                                      <input
                                          type={showPassword ? "text" : "password"}
                                          id="password"
                                          name="password"
                                          value={password}
                                          onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (e.target.value.trim() !== ''){
                                              setPasswordError('');
                                            }
                                          }}
                                          placeholder="Enter at least 6 characters"
                                          className="w-full p-3 border h-[45px] bg-gray-100 border-gray-100 rounded focus:outline-none focus:border-gray-200"
                                      />
                                      {passwordError && <p className="text-red-500 text-sm font-medium mt-1">{passwordError}</p>}
                                      <button type="button" onClick={togglePassword} className="absolute right-3 top-3 text-gray-500">
                                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                                      </button>
                                  </div>
          
                                  <button
                                      type="submit"
                                      className="w-full h-[45px] bg-gray-800 text-white rounded-full hover:bg-gray-700 transition mb-6"
                                  >
                                      Signup
                                  </button>
          
                                  <div className="flex items-center justify-center mb-4">
                                      <span className="w-full max-w-[100px] border-t border-gray-300"></span>
                                      <span className="px-3 text-gray-500 text-sm">or continue with</span>
                                      <span className="w-full max-w-[100px] border-t border-gray-300"></span>
                                  </div>
          
                                  <div className="flex justify-center mb-4">
                                      <button
                                          type="button"
                                          className="w-[100px] h-[45px] bg-gray-100 text-black border-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 hover:border-gray-500 transition"
                                      >
                                          <FcGoogle className="h-7 w-7" />
                                      </button>
                                  </div>
          
                                  <div className="text-center mb-4">
                                      <span className="text-gray-400 text-xs font-medium block">
                                          By continuing, you agree to Musify's
                                      </span>
                                      <span className="text-gray-400 text-xs font-medium block">
                                          <a href="/terms" className="text-gray-500 hover:underline">
                                              Terms of Use
                                          </a>{" "}
                                          and
                                          <a href="/privacy" className="text-gray-500 hover:underline">
                                              {" "}
                                              Privacy Policy
                                          </a>
                                      </span>
                                  </div>
          
                                  <div className="text-center">
                                      <span className="text-gray-400 text-xs font-medium ">Already have an account? </span>
                                      <Link to="/login" className="text-gray-500 text-sm hover:underline font-semibold">
                                          Login
                                      </Link>
                                  </div>
                              </form>
                                ):(
                                  <div className="otp-modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
                                    <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
                                      <h2 className="text-center text-2xl font-bold mb-4">Verify OTP</h2>
                                      {otpError && (
                                        <p className="text-red-500 text-sm font-medium mb-4">{otpError}</p>
                                      )}
                                      <form onSubmit={handleOtpSubmit}>
                                      <input
                                          type="email"
                                          id="email"
                                          name="email"
                                          value={email}
                                          onChange={(e) => setEmail(e.target.value)}
                                          placeholder="Email"
                                          className="w-full p-3 border h-[45px] bg-gray-100 border-gray-100 rounded focus:outline-none focus:border-gray-200 mb-5"
                                      />
                                      {emailError && <p className="text-red-500 text-sm font-medium mt-1">{emailError}</p>}


                                        <input
                                          type="text"
                                          placeholder="Enter OTP"
                                          value={otp}
                                          onChange={(e) => setOtp(e.target.value)}
                                          required
                                          className="w-full p-3 border mb-4 bg-gray-100 border-gray-100 rounded focus:outline-none focus:border-gray-200"
                                        />
                                        <button
                                          type="submit"
                                          className="w-full h-[45px] bg-gray-800 text-white rounded-full hover:bg-gray-700 transition"
                                        >
                                          Verify OTP
                                        </button>
                                      </form>
                                      {/* <button
                                        type="button"
                                        // onClick={handleResendOtp} 
                                        className="w-full mt-4 h-[45px] bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
                                      >
                                        Resend OTP
                                      </button> */}
                                    </div>
                                  </div>
                                )}
                          </div>
                      </div>
        </div>
    );
}

export default Signup;
