import React, { useState, useEffect } from "react";
import { auth, db, provider } from "../firebase-config";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useGlobalModal } from "../context/ModalContext";


function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
    const { showModal } = useGlobalModal();


  const handleSignUp = async (e) => {
    e.preventDefault();

 if (!name || !email || !password || !confirm) {
  return showModal({
    type: "error",
    message: "Please fill in all fields",
  });
}


 if (password !== confirm) {
  return showModal({
    type: "error",
    message: "Passwords do not match",
  });
}


    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await sendEmailVerification(user);

      // Save new user data in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        name,
        email,
        createdAt: serverTimestamp(),
      });
showModal({
  type: "success",
  message: "Account created! Please verify your email.",
});

      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
       showModal({
  title: "Signup Failed",
  message: error.message,
  type: "error"
});
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      showModal({
  title: "Google Signup Successful",
  message: "You're now logged in with Google.",
  type: "success"
});
      navigate("/home");
    } catch (error) {
         showModal({
  title: "Google Signup Failed",
  message: error.message,
  type: "error"
});
    }
  };

  return (
    <div className="form-container">
      <img
        src="dark mode .png"
        alt="Store Logo"
        className="auth-logo"
        onClick={() => window.location.href = "/"}
      />
      <h2>Create Your Account</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>

        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <FontAwesomeIcon
            icon={showConfirmPassword ? faEyeSlash : faEye}
            className="eye-icon"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </div>

        <button type="submit">Create Account</button>
      </form>

      <div className="divider">
        <span>OR</span>
      </div>

      <button className="google-signin-btn" onClick={handleGoogleSignUp}>
        <div className="google-icon-wrapper">
          <img
            className="google-icon"
            src="./public/google-icon.png"
            alt="Google sign-in"
          />
        </div>
        <p>Continue With Google</p>
      </button>

      <p>
        Already have an account? <a href="/login">Log in here</a>
      </p>
    </div>
  );
}

export default SignUp;