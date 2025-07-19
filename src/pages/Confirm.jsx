// src/pages/Confirm.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { collection, addDoc, Timestamp, doc, getDoc,getDocs } from "firebase/firestore";
import { useGlobalModal } from "../context/ModalContext";
import "../test.css";
import "../home.css";

function Confirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderDetails = location.state?.orderDetails;
    const { showModal } = useGlobalModal();

  useEffect(() => {
    if (!orderDetails) {
      alert("Invalid access. Please place an order first.");
      navigate("/home");
    }
  }, [orderDetails, navigate]);

const handleCompleteOrderClick = async () => {
  const button = document.querySelector(".order");

  if (!button.classList.contains("animate")) {
    button.classList.add("animate");

    setTimeout(async () => {
      try {
        const user = auth.currentUser;

        if (!user || !orderDetails) {
          showModal({
            title: "Something Went Wrong",
            message: "Please login to continue",
            type: "error"
          });
          navigate("/home");
          return;
        }

        // Fetch cart items
        const cartRef = doc(db, "carts", user.uid);
        const cartSnap = await getDoc(cartRef);
        const cartItems = cartSnap.exists() ? cartSnap.data().items || [] : [];

        // Fetch address (use `name`, not fullName)
        const addressesRef = collection(db, "users", user.uid, "addresses");
        const addressesSnapshot = await getDocs(addressesRef);

        let address = {
          name: "Customer",
          address: "Not Provided",
          city: "",
          pincode: "",
          state: "",
          country: "",
          phone: ""
        };

        if (!addressesSnapshot.empty) {
          const data = addressesSnapshot.docs[0].data();
          address = {
            name: data.name || "Customer",
            address: data.address || "",
            city: data.city || "",
            pincode: data.pincode || "",
            state: data.state || "",
            country: data.country || "",
            phone: data.phone || ""
          };
        }

        // Calculate total
        const totalAmount = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // Save order
        const orderDocRef = await addDoc(collection(db, "orders"), {
          ...orderDetails,
          userId: user.uid,
          email: user.email,
          createdAt: Timestamp.now(),
          items: cartItems,
          shippingAddress: address,
          totalAmount
        });

        const documentId = orderDocRef.id;
        const paymentMethod = orderDetails.paymentMethod || "Not Specified";

        // Send confirmation email
        await addDoc(collection(db, "emails"), {
          to: user.email,
          message: {
            subject: "🛒 Order Confirmation - Thank you for shopping with us!",
          html: `
  <div style="font-family: 'Segoe UI', sans-serif; background-color: #121212; padding: 32px;">
    <div style="max-width: 600px; margin: auto; background: #1e1e1e; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.3); color: white;">
      
      <div style="background-color: #BA93B1; padding: 20px 40px; color: white;">
        <h1 style="margin: 0; font-size: 24px;">✨ Order Confirmed!</h1>
        <p style="margin: 4px 0 0;">Thank you for your purchase.</p>
      </div>

      <div style="padding: 24px 40px; color: white;">
        <p>Hi <strong>${address.name}</strong>,</p>
        <p>We've received your order and it's now being processed. Below are your order details:</p>
        
        <div style="background: #2a2a2a; padding: 16px; border-radius: 8px; margin-top: 16px;">
          <h3 style="margin-top: 0;">🧾 Order Summary</h3>
          <ul style="padding-left: 18px; line-height: 1.6;">
            <li><strong>Order ID:</strong> #${documentId}</li>
            ${cartItems
              .map(
                (item) =>
                  `<li>${item.quantity}x ${item.name} — ₹${item.price * item.quantity}</li>`
              )
              .join("")}
            <li><strong>Total Amount:</strong> ₹${totalAmount}</li>
            <li><strong>Payment Method:</strong> ${paymentMethod}</li>
          </ul>
        </div>

        <div style="margin-top: 24px;">
          <h3>📦 Shipping Address</h3>
          <p>
            ${address.name}<br/>
            ${address.address}<br/>
            ${[address.city, address.state, address.pincode].filter(Boolean).join(", ")}<br/>
            ${address.country}<br/>
            ${address.phone ? `Phone: ${address.phone}` : ""}
          </p>
        </div>

        <div style="margin-top: 24px;">
          <p style="font-size: 15px; color: #ccc;">You will receive another email when your order has been shipped.</p>
        </div>
      </div>

      <div style="background-color: #2a2a2a; padding: 16px 40px; text-align: center; font-size: 13px; color: #aaa;">
        © ${new Date().getFullYear()} Lumina. All rights reserved.<br/>
        Need help? <a href="mailto:lumina08@gmail.com" style="color: #BA93B1; text-decoration: none;">Contact Support</a>
      </div>
    </div>
  </div>
`


          }
        });

        showModal({
          title: "✅ Order Placed Successfully",
          message: "Visit Again, Waiting For Your Next Orders!",
          type: "success"
        });

        navigate("/home");
      } catch (err) {
        console.error("Order Error:", err);
        showModal({
          title: "Order Failed",
          message: `Please Try Again. Error: ${err.message}`,
          type: "error"
        });
        navigate("/home");
      }
    }, 10000); // Animation delay
  }
};


  return (
    <div className="confirm-page-body">
      <div className="top-navbar">
        <div className="logo">
          <a href="/home">
            <img id="siteLogo" src="dark mode .png" alt="Logo" />
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

        <div className="order-confirm-container">
          <div className="order-card">
            <h1><i className="fas fa-shopping-bag"></i> Order Summary</h1>
            <div id="order-items">
              <p>Click the button below to complete your order 💫</p>
            </div>

            <div className="payment-method">
              <p><strong>Payment Method:</strong> {orderDetails?.paymentMethod}</p>
            </div>

            <button className="order" onClick={handleCompleteOrderClick}>
              <span className="default">Complete Order</span>
              <span className="success">
                Visit P_Lumina Again💕
                <svg viewBox="0 4 14 10">
                  <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                </svg>
              </span>
              <div className="box"></div>
              <div className="truck">
                <div className="back"></div>
                <div className="front"><div className="window"></div></div>
                <div className="light top"></div>
                <div className="light bottom"></div>
              </div>
              <div className="lines"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Confirm;
