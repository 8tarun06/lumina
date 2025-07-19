import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { doc, getDoc, updateDoc, arrayRemove, } from "firebase/firestore";
import { useGlobalModal } from "../context/ModalContext";
import "../cart.css";
import "../home.css";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const searchInputRef = useRef(null);
  const { showModal } = useGlobalModal();

 useEffect(() => {
  const loadCart = async (user) => {
    try {
      const cartRef = doc(db, "carts", user.uid);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        setCart(cartSnap.data().items || []);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      showModal({
        title: "Failed To Load Cart",
        message: "Items cant be loaded Please Refresh Or Check After Some Time",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentUser = auth.currentUser;

  if (currentUser) {
    loadCart(currentUser);
  } else {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        showModal({
          title: "Login First",
          message: "Please login in to Continue",
          type: "error",
        });
        navigate("/login");
        return;
      }
      loadCart(user);
    });

    return () => unsubscribe();
  }
}, [navigate]);


  const filteredCart = cart.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchIconClick = () => {
    setSearchActive(true);
    setTimeout(() => {
      if (searchInputRef.current) searchInputRef.current.focus();
    }, 100);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
          showModal({
  title: "Voice Seacrh Error",
  message: "Voice Search Not Working Refresh Or Type Manually",
  type: "error"
});
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
      console.error("Voice error:", event.error);
         showModal({
  title: "Voice Input Failed",
  message: "Oops Mic Didnt Catch Your Voice Try Again😉",
  type: "error"
});
    };
  };

  const decreaseQuantity = async (itemId) => {
    const user = auth.currentUser;
    if (!user) return;

    const cartRef = doc(db, "carts", user.uid);
    const currentCart = [...cart];
    const index = currentCart.findIndex((item) => item.id === itemId);
    if (index === -1) return;

    if (currentCart[index].quantity > 1) {
      const updatedCart = currentCart.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
      );
      await updateDoc(cartRef, { items: updatedCart });
      setCart(updatedCart);
    } else {
      await updateDoc(cartRef, {
        items: arrayRemove(currentCart[index]),
      });
      setCart(currentCart.filter((item) => item.id !== itemId));
    }
  };

  const increaseQuantity = async (itemId) => {
    const user = auth.currentUser;
    if (!user) return;

    const cartRef = doc(db, "carts", user.uid);
    const currentCart = [...cart];
    const index = currentCart.findIndex((item) => item.id === itemId);
    if (index === -1) return;

    const updatedCart = currentCart.map((item) =>
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    );
    await updateDoc(cartRef, { items: updatedCart });
    setCart(updatedCart);
  };

  const removeItem = async (itemId) => {
    const user = auth.currentUser;
    if (!user) return;

    const cartRef = doc(db, "carts", user.uid);
    const itemToRemove = cart.find((item) => item.id === itemId);
    if (!itemToRemove) return;

    await updateDoc(cartRef, {
      items: arrayRemove(itemToRemove),
    });
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const calculateSubtotal = () =>
    cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + price * quantity;
    }, 0).toFixed(2);

  const formatPrice = (price) => `₹ ${parseFloat(price).toFixed(2)}`;

  if (loading) return <div className="loading">Loading your cart...</div>;

  return (
    <>
      <div className="top-navbar">
        <div className="logo">
          <a href="/home">
            <img id="siteLogo" src="dark mode .png" alt="Logo" />
          </a>
        </div>

        <div className="search-bar-container">
          <button className="search-icon" onClick={handleSearchIconClick}>
            <img src="/public/search.png" alt="Search" className="search-icon-img" />
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
                <img src="/public/mic.png" alt="Mic" className="mic-icon-img" />
              </button>
            </div>
          </div>
        </div>

        <div className="wishlist-btn">
          <a href="/wishlist">
            <button className="wishlist-btn" aria-label="Wishlist">
              <i className="fas fa-heart"></i>
            </button>
          </a>
        </div>
        <div className="cart-icon-wrapper">
          <a href="/cart" className="cart-link">
            <i className="fas fa-shopping-cart"></i>
            <span id="cart-count">{cart.reduce((a, b) => a + (b.quantity || 1), 0)}</span>
          </a>
        </div>
      </div>

      <div className="layout">
        <aside className="sidebar" id="sidebar">
          <ul>
            <li><a href="/account">Your Account</a></li>
            <li><a href="/orders">Your Orders</a></li>
            <li><a href="/addresses">Addresses</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li>
              <button
                onClick={() => {
                  localStorage.removeItem("isLoggedIn");
                  localStorage.removeItem("userEmail");
                  auth.signOut().then(() => window.location.href = "/login");
                }}
                className="logout-btn"
              >Logout</button>
            </li>
            <div className="footer">
              <span className="theme">Lumina</span> @All Rights Reserved
            </div>
          </ul>
        </aside>

        <div className="main-body">
          <div className="cart-container">
            <div className="cart-items">
              {filteredCart.length === 0 ? (
                <div className="empty-cart">
                  Your Cart Is Empty
                </div>
              ) : (
                filteredCart.map((item) => {
                  const price = parseFloat(item.price) || 0;
                  const quantity = parseInt(item.quantity) || 1;
                  return (
                    <div className="cart-item" key={`${item.id}-${item.addedAt}`}>
                      <img src={item.image} className="cart-item-image" alt={item.name} />
                      <div className="cart-item-details">
                        <h3 className="cart-item-title">{item.name}</h3>
                        <p className="cart-item-price">{formatPrice(price)}</p>
                        <div className="cart-item-quantity">
                          <button className="quantity-btn minus" onClick={() => decreaseQuantity(item.id)}>-</button>
                          <span>{quantity}</span>
                          <button className="quantity-btn plus" onClick={() => increaseQuantity(item.id)}>+</button>
                        </div>
                        <button className="cart-item-remove" onClick={() => removeItem(item.id)}>Remove</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="cart-summary">
              <div className="summary-details">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span id="subtotal">{formatPrice(calculateSubtotal())}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span id="total">{formatPrice(calculateSubtotal())}</span>
                </div>
                <button
                  className="checkout-btn"
                  onClick={() => cart.length === 0
                    ? alert("Your cart is empty!")
                    : navigate("/checkout")}
                  disabled={cart.length === 0}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Cart;
