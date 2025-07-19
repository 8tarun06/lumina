import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Loader
import LoadingScreen from "./components/LoadingScreen";

// Pages
import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Confirm from "./pages/Confirm";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import AddressPage from "./pages/AddressPage";
import YourAccount from "./pages/YourAccount";
import Paymentmethods from "./pages/Paymentmethods";
import ProfileSettings from "./pages/Profilesettings";
import ContactPage from "./pages/Contactpage";
import AboutPage from "./pages/AboutPage";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoaderFinish = () => {
    setIsLoading(false);
  };

  return (
    <Router>
      {/* Global Toast Notifications */}
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Global Loading Screen */}
      {isLoading ? (
        <LoadingScreen onFinish={handleLoaderFinish} />
      ) : (
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirm" element={<Confirm />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/addresses" element={<AddressPage />} />
          <Route path="/account" element={<YourAccount />} />
          <Route path="/payment-methods" element={<Paymentmethods />} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
