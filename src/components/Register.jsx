import React, { useState } from "react";
import { useFirebase } from "../context/FirebaseContext";
import { useNavigate } from "react-router-dom";
import "./css/Register.css"; 

const Register = () => {
  const { signup } = useFirebase();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      return alert("All fields are required!");
    }
    if (password !== confirmPassword) {
      return alert("Passwords do not match!");
    }

    try {
      await signup(email, password, { displayName: name });
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      alert("Registration failed: " + err.message);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h2>Create Account</h2>
          <p>Fill in your details to register</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">

          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

<div className="input-group password-group">
  <label>Password</label>
  <div className="password-wrapper">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <span
      className="password-toggle"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? "👁️‍🗨️" : "👁️"}
    </span>
  </div>
</div>

<div className="input-group password-group">
  <label>Confirm Password</label>
  <div className="password-wrapper">
    <input
      type={showConfirmPassword ? "text" : "password"}
      placeholder="Confirm your password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      required
    />
    <span
      className="password-toggle"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    >
      {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
    </span>
  </div>
</div>


          <button type="submit" className="register-btn">Register</button>

          <div className="register-footer">
            <p onClick={() => navigate("/login")}>Already have an account? Login</p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Register;
