import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useGlobalModal } from "../context/ModalContext";
import "../checkout.css";
import "../orderplace.css";
import "../home.css";

function Checkout() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "COD"
  });
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
 const { showModal } = useGlobalModal();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
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

    const fetchAddresses = async () => {
      try {
        const addressesRef = collection(db, "users", user.uid, "addresses");
        const snapshot = await getDocs(addressesRef);
        const addressesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAddresses(addressesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching addresses:", error);
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSelect = (address) => {
    setForm({
      fullName: address.name,
      phone: address.phone,
      address: `${address.addressLine1}${address.addressLine2 ? `, ${address.addressLine2}` : ''}`,
      city: address.city,
      pincode: address.zipCode,
      paymentMethod: form.paymentMethod
    });
  };

  const handleOrderSubmit = async () => {
    if (!form.fullName || !form.phone || !form.address || !form.city || !form.pincode) {
  showModal({
    title: "Select Address First",
    message: "Please go to Your Addresses page to add a new address before checkout.",
    type: "info"
  });
  return;
}

    const user = auth.currentUser;
    if (!user) {
      showModal({
  title: "Please Login First",
  message: "Sorry For The Inconvience Just To Be Sure Please login in to Continue",
  type: "error"
});
      return;
    }

    // Validate form
    if (!form.fullName || !form.phone || !form.address || !form.city || !form.pincode) {
       showModal({
  title: "Fill All Input Fields",
  message: "Please Fill All The Details",
  type: "info"
});
      return;
    }

    const orderDetails = {
      fullName: form.fullName,
      phone: form.phone,
      address: form.address,
      city: form.city,
      pincode: form.pincode,
      paymentMethod: form.paymentMethod,
      status: form.paymentMethod === "COD" ? "Pending" : "Paid",
      userId: user.uid,
      email: user.email,
      createdAt: new Date()
    };

    if (form.paymentMethod === "COD") {
         showModal({
  title: "✅Order Placed VIA Cash On Delivery",
  message: "Yayyy Order Placed Thanks For Choosing Us",
  type: "sucess"
});
      navigate("/confirm", { state: { orderDetails } });
    } else {
      try {
        const cartRef = doc(db, "carts", user.uid);
        const cartSnap = await getDoc(cartRef);

        if (!cartSnap.exists()) {
               showModal({
  title: "Your Cart Is Empty",
  message: "Please Check Your Cart to Continue",
  type: "error"
});
          return;
        }

        const cartItems = cartSnap.data().items || [];
        if (cartItems.length === 0) {
              showModal({
  title: "No Items In A Cart",
  message: "Please Check Your Cart to Continue",
  type: "error"
});
          return;
        }

        const totalAmount = cartItems.reduce(
          (sum, item) => sum + item.price * (item.quantity || 1),
          0
        );
        const amountInPaisa = totalAmount * 100;

        const razorpayOptions = {
          key: "rzp_test_wKCDhkFh4tbwTB",
          amount: amountInPaisa,
          currency: "INR",
          name: "P_Lumina",
          description: "Order Payment",
          image: "logo.jpeg",
          handler: async function (response) {
            const paidOrder = {
              ...orderDetails,
              status: "Paid",
              razorpay_payment_id: response.razorpay_payment_id
            };
            navigate("/confirm", { state: { orderDetails: paidOrder } });
          },
          prefill: {
            name: form.fullName,
            email: user.email,
            contact: form.phone
          },
          theme: {
            color: "#BA93B1"
          }
        };

        const rzp = new window.Razorpay(razorpayOptions);
        rzp.open();
      } catch (error) {
        console.error("🔥 Razorpay Error:", error.message);
     showModal({
  title: "Failed To Start RazorPay",
  message: "Sorry For The Inconvience Please Retry The Payment",
  type: "error"
});
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="checkout-page">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
      
      <motion.div 
        className="checkout-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="checkout-header" variants={itemVariants}>
          <h2>Checkout</h2>
          <p>Complete your purchase with secure payment</p>
        </motion.div>

        <motion.div className="checkout-section" variants={itemVariants}>
          <h3>Shipping Address</h3>
          
          {loading ? (
            <div className="loading-spinner">Loading addresses...</div>
          ) : (
           <>
    {addresses.length > 0 ? (
      <div className="address-selector">
        <label>Select Saved Address</label>
        <select
          onChange={(e) => {
            const selectedAddress = addresses.find(addr => addr.id === e.target.value);
            if (selectedAddress) handleAddressSelect(selectedAddress);
          }}
        >
          <option value="">Choose an address</option>
          {addresses.map(address => (
            <option key={address.id} value={address.id}>
              {address.name} - {address.addressLine1}, {address.city}
              {address.isDefault && " (Default)"}
            </option>
          ))}
        </select>
        <button 
          className="add-new-address-btn"
          onClick={() => navigate("/addresses")}
        >
          Manage Addresses
        </button>
      </div>
    ) : (
      <div className="no-address-warning">
        <p>No saved addresses found.</p>
        <button 
          className="add-new-address-btn"
          onClick={() => navigate("/addresses")}
        >
          Add Address to Proceed
        </button>
      </div>
    )}
  </>
          )}
        </motion.div>

        <motion.div className="checkout-section" variants={itemVariants}>
          <h3>Payment Method</h3>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={form.paymentMethod === "COD"}
                onChange={handleInputChange}
              />
              <div className="payment-content">
                <span>Cash on Delivery (COD)</span>
                <small>Pay when you receive your order</small>
              </div>
            </label>
            
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="Online"
                checked={form.paymentMethod === "Online"}
                onChange={handleInputChange}
              />
              <div className="payment-content">
                <span>Online Payment</span>
                <small>Secure payment via Razorpay</small>
              </div>
            </label>
          </div>
        </motion.div>

        <motion.div 
          className="checkout-footer"
          variants={itemVariants}
        >
          <button 
            className="confirm-order-btn"
            onClick={handleOrderSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Confirm Order
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Checkout;