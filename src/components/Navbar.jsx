import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase-config";
import "../home.css";

function Navbar({ cartCount }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const searchInputRef = useRef(null);

  const handleSearchIconClick = () => {
    setSearchActive(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      setSearchActive(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);
      alert("Voice recognition failed. Please try again.");
    };
  };

  return (
    <div className="top-navbar">
      <div className="logo">
        <Link to="/home">
          <img id="siteLogo" src="dark mode .png" alt="Logo" />
        </Link>
      </div>

      <div className="search-bar-container">
        <button className="search-icon" onClick={handleSearchIconClick}>
          <img src="search.png" alt="Search" className="search-icon-img" />
        </button>

        <div className={`search-input-wrapper ${searchActive ? "active" : ""}`}>
          <div className="search-input-inner">
            <input
              type="text"
              ref={searchInputRef}
              placeholder="Search Products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onBlur={() => {
                if (searchTerm === "") setSearchActive(false);
              }}
            />
            <button className="mic-icon" onClick={startVoiceInput}>
              <img src="mic.png" alt="Mic" className="mic-icon-img" />
            </button>
          </div>
        </div>
      </div>

      <div className="wishlist-btn" title="Go to Wishlist">
        <Link to="/wishlist">
          <i className="fas fa-heart"></i>
        </Link>
      </div>

      <div className="cart-icon-wrapper">
        <Link to="/cart" className="cart-link">
          <i className="fas fa-shopping-cart"></i>
          <span id="cart-count">{cartCount}</span>
        </Link>
      </div>
    </div>
  );
}

export default Navbar;