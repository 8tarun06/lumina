import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import "../home.css";
import "../styles/paymentmethods.css";
import { useGlobalModal } from "../context/ModalContext";

function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [editingCardId, setEditingCardId] = useState(null);
  const [form, setForm] = useState({
    cardNumber: "",
    cardHolderName: "",
    expiryMonth: "",
    expiryYear: "",
    brand: "card",
  });
 const { showModal } = useGlobalModal();


  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      fetchCards(user);
    }
  });

  return () => unsubscribe(); // Clean up
}, []);

 const fetchCards = async (user) => {
  const ref = collection(db, "users", user.uid, "cards");
  const snap = await getDocs(ref);
  const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  setMethods(data);
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const detectCardType = (number) => {
    if (/^4/.test(number)) return "visa";
    if (/^5[1-5]/.test(number)) return "mastercard";
    if (/^6/.test(number)) return "rupay";
    return "card";
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    const { cardNumber, cardHolderName, expiryMonth, expiryYear } = form;

    if (!/\d{16}/.test(cardNumber)) {
            showModal({
  title: "❌Card Number Must Be 16 Numbers Exactly",
  message: "Add Card Number Carefully",
  type: "error"
});
      return;
    }
    if (cardHolderName.trim().length < 3) {
              showModal({
  title: "❌Please Add A Valid CardHolderc Name",
  message: "Add CardHolder Name Carefully",
  type: "error"
});
      return;
    }
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    if (
      parseInt(expiryYear) < currentYear ||
      (parseInt(expiryYear) === currentYear &&
        parseInt(expiryMonth) < currentMonth)
    ) {
              showModal({
  title: "❌Card Expiry Date Is Invalid",
  message: "Add a Valid Card Details",
  type: "error"
});
      return;
    }

    const brand = detectCardType(cardNumber);
    const user = auth.currentUser;
    if (!user) return;

    try {
      if (editingCardId) {
        const cardRef = doc(db, "users", user.uid, "cards", editingCardId);
        await updateDoc(cardRef, {
          cardNumber,
          cardHolderName,
          expiryMonth: parseInt(expiryMonth),
          expiryYear: parseInt(expiryYear),
          brand,
        });
          showModal({
  title: "✅Card Saved Successfully",
  message: "Yourr Payment Method Added Succesfully Now You Can Seamlessly Order From Our Website",
  type: "sucess"
});
      } else {
        await addDoc(collection(db, "users", user.uid, "cards"), {
          cardNumber,
          cardHolderName,
          expiryMonth: parseInt(expiryMonth),
          expiryYear: parseInt(expiryYear),
          brand,
          addedAt: new Date(),
        });
           showModal({
  title: "✅Card Saved Successfully",
  message: "Yourr Payment Method Added Succesfully Now You Can Seamlessly Order From Our Website",
  type: "sucess"
});
      }

      setForm({
        cardNumber: "",
        cardHolderName: "",
        expiryMonth: "",
        expiryYear: "",
        brand: "card",
      });
      setEditingCardId(null);
      fetchCards();
    } catch (err) {
      console.error("Error saving card:", err);
             showModal({
  title: "❌Failed To Add Card",
  message: "Failed To Add Your Card Check Details Carefully And Add Again",
  type: "error"
});
    }
  };

  const deleteCard = async (id) => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "cards", id));
    fetchCards();
  };

  const handleEdit = (card) => {
    setEditingCardId(card.id);
    setForm({
      cardNumber: card.cardNumber,
      cardHolderName: card.cardHolderName,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      brand: card.brand,
    });
  };

  return (
    <>
      {/* ✅ Top Navbar */}
      <div className="top-navbar">
        <div className="logo">
          <a href="/home">
            <img id="siteLogo" src="dark mode .png" alt="Logo" />
          </a>
        </div>

        <div className="wishlist-btn" title="Go to Wishlist">
          <a href="/wishlist">
            <i className="fas fa-heart"></i>
          </a>
        </div>

        <div className="cart-icon-wrapper">
          <a href="/cart" className="cart-link">
            <i className="fas fa-shopping-cart"></i>
          </a>
        </div>
      </div>

      <div className="layout">
        {/* ✅ Sidebar */}
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
              <span className="theme">Princyy</span> @All Rights Reserved
            </div>
          </ul>
        </aside>

        <section className="payment-methods">
          <h2>{editingCardId ? "Edit Card" : "Saved Cards"}</h2>

          <form className="payment-form" onSubmit={handleSaveCard}>
            <input
              type="text"
              name="cardHolderName"
              placeholder="Cardholder Name"
              value={form.cardHolderName}
              onChange={handleInputChange}
            />

            <div className="card-input-wrapper">
              <input
                type="text"
                name="cardNumber"
                placeholder="Card Number (16 digits)"
                value={form.cardNumber}
                maxLength={16}
                onChange={(e) => {
                  handleInputChange(e);
                  setForm((prev) => ({
                    ...prev,
                    brand: detectCardType(e.target.value),
                  }));
                }}
              />
              <img
                src={`/card-icons/${form.brand?.toLowerCase() || "card"}.png`}
                alt="card icon"
                className="card-icon"
              />
            </div>

            <div className="expiry-row">
              <select
                name="expiryMonth"
                value={form.expiryMonth}
                onChange={handleInputChange}
              >
                <option value="">Month</option>
                {[...Array(12)].map((_, i) => {
                  const month = String(i + 1).padStart(2, "0");
                  return (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  );
                })}
              </select>

              <select
                name="expiryYear"
                value={form.expiryYear}
                onChange={handleInputChange}
              >
                <option value="">Year</option>
                {Array.from({ length: 12 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <button type="submit">
              {editingCardId ? "💾 Save Changes" : "💾 Save Card"}
            </button>
          </form>

          <div className="cards-grid">
            {methods.map((card) => (
              <div key={card.id} className="card-box">
                <p>
                  <strong>{card.brand}:</strong> **** **** **** {card.cardNumber.slice(-4)}
                </p>
                <p>{card.cardHolderName}</p>
                <p>
                  Exp: {card.expiryMonth}/{card.expiryYear}
                </p>
                <div className="card-buttons">
                  <button onClick={() => handleEdit(card)}>✏️ Edit</button>
                  <button onClick={() => deleteCard(card.id)}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default PaymentMethods;
