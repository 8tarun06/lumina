import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import "../home.css";
import { useGlobalModal } from "../context/ModalContext";

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const searchInputRef = useRef(null);

  const [wishlistIds, setWishlistIds] = useState([]);
    const { showModal } = useGlobalModal();

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      showModal({
        title: "Login First",
        message: "Please login in to Continue",
        type: "error",
      });
      navigate("/login");
    }
  });

  return () => unsubscribe(); // Cleanup
}, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productRef = collection(db, "products");
        const snapshot = await getDocs(productRef);
        const productList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
      } catch (err) {
        console.error("Failed to load products:", err.message);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const wishlistRef = doc(db, "wishlists", user.uid);
      const wishlistSnap = await getDoc(wishlistRef);

      if (wishlistSnap.exists()) {
        const items = wishlistSnap.data().items || [];
        setWishlistIds(items.map((item) => item.id));
      }
    };

    fetchWishlist();
  }, []);

  const addToCart = async (product) => {
    const user = auth.currentUser;
    if (!user) {
           showModal({
  title: "Login First",
  message: "Please login in to Continue",
  type: "error"
});
      navigate("/login");
      return;
    }

    try {
      const cartRef = doc(db, "carts", user.uid);
      const cartSnap = await getDoc(cartRef);
      const productWithMeta = {
        ...product,
        quantity: 1,
        addedAt: Date.now(),
      };

      if (cartSnap.exists()) {
        const existingItems = cartSnap.data().items || [];
        const alreadyExists = existingItems.find((item) => item.id === product.id);
        if (alreadyExists) {
                showModal({
  title: "Item Already Added in a Cart",
  type: "info"
});
          return;
        }
        await updateDoc(cartRef, {
          items: arrayUnion(productWithMeta),
        });
      } else {
        await setDoc(cartRef, {
          items: [productWithMeta],
        });
      }

     showModal({
  title: "Added to Cart",
  message: `${product.name} has been added to your cart.`,
  type: "success"
});

      setCart((prev) => [...prev, productWithMeta]);
    } catch (error) {
      console.error("Error adding to cart:", error);
showModal({
  title: "Failed to Cart",
  message: `${product.name} Failed to add to your cart.`,
  type: "error"
});

    }
  };

  const toggleWishlist = async (product) => {
    const user = auth.currentUser;
    if (!user) {
showModal({
  title: "Login First To Manage Wishlist",
  message: `Please Login First`,
  type: "error"
});

      navigate("/login");
      return;
    }

    const wishlistRef = doc(db, "wishlists", user.uid);
    const wishlistSnap = await getDoc(wishlistRef);
    let wishlistItems = wishlistSnap.exists() ? wishlistSnap.data().items || [] : [];

    const alreadyInWishlist = wishlistItems.some(item => item.id === product.id);

    if (alreadyInWishlist) {
      wishlistItems = wishlistItems.filter(item => item.id !== product.id);
      await setDoc(wishlistRef, { items: wishlistItems });
      setWishlistIds(prev => prev.filter(id => id !== product.id));
    } else {
      wishlistItems.push({ ...product, addedAt: Date.now() });
      await setDoc(wishlistRef, { items: wishlistItems });
      setWishlistIds(prev => [...prev, product.id]);
    }
  };

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
   showModal({
  title: "Voice Recognition is Not Supported In Your Device/Browser",
  message: `Voice to Search cant be used right Please use Manual Search!!`,
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
      console.error("Voice recognition error:", event.error);
showModal({
  title: "Voice Recognition Failed",
  message: `Please Try Again Later`,
  type: "error"
});

    };
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
  const fetchCartFromFirestore = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const cartRef = doc(db, "carts", user.uid);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const items = cartSnap.data().items || [];
        setCart(items); // ✅ update the state with all cart items
      }
    } catch (err) {
      console.error("Error loading cart from Firebase:", err.message);
    }
  };

  fetchCartFromFirestore();
}, []);


  return (
    <>
      {/* ✅ Top Navbar */}
      <div className="top-navbar">
        <div className="logo">
          <a href="/home">
            <img id="siteLogo" src="dark mode .png" alt="Logo" />
          </a>
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
  <a href="/wishlist">
    <i className="fas fa-heart"></i>
  </a>
</div>


        <div className="cart-icon-wrapper">
          <a href="/cart" className="cart-link">
            <i className="fas fa-shopping-cart"></i>
          <span id="cart-count">
  {cart.reduce((total, item) => total + (item.quantity || 1), 0)}
</span>

          </a>
        </div>
      </div>

      {/* ✅ Layout with Sidebar and Product Grid */}
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
                  auth.signOut().then(() => {
                    window.location.href = "/login";
                  });
                }}
                className="logout-btn"
              >
                Logout
              </button>
            </li>
            <div className="footer">
              <span className="theme">Lumina</span> @All Rights Reserved
            </div>
          </ul>
        </aside>

        <section className="product-grid">
          {filteredProducts.length === 0 ? (
            <p style={{ color: "white" }}>No products found.</p>
          ) : (
            filteredProducts.map((product) => (
              <div className="product-card" key={product.id}>
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <div className="product-title">{product.name}</div>
                  <div className="product-price">₹{product.price}</div>
                  <button className="add-to-cart" onClick={() => addToCart(product)}>
                    Add to Cart
                  </button>
                </div>

                {/* ✅ Wishlist icon with toggle */}
               <div
  className={`wishlist-icon ${wishlistIds.includes(product.id) ? "active" : ""}`}
  onClick={() => toggleWishlist(product)}
  title={
    wishlistIds.includes(product.id)
      ? "Remove from Wishlist"
      : "Add to Wishlist"
  }
>
  <i className="fas fa-heart"></i>
</div>

              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}

export default Home;
