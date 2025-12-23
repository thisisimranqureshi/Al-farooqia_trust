import React, { useState } from "react";
import "./css/Login.css";
import SignIn from "./signIn";
import { useFirebase } from "../context/FirebaseContext";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useFirebase();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      alert("Login successful!");
      // Redirect to original page or home
      const redirectPath = location.state?.from || "/";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">Login</button>

          {/* <div className="login-footer">
            <p>Forgot Password?</p>
          </div> */}
        </form>


<div className="login-footer">
 
  <p>
    Don't have an account?{" "}
    <button
      className="register-btn"
      type="button"
      onClick={() => navigate("/register")}
    >
      Register
    </button>
  </p>
</div>

        <SignIn />
      </div>
      
    </div>
  );
};

export default Login;
