// components/GlobalModal.jsx
import { AnimatePresence, motion } from "framer-motion";
import { useGlobalModal } from "../context/ModalContext";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import "../globalmodal.css";

const GlobalModal = () => {
  const {
    isOpen,
    title,
    message,
    type,
    closeModal,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
  } = useGlobalModal();

  const iconMap = {
    success: <CheckCircle size={40} color="#00ff0dff" />,
    error: <AlertTriangle size={40} color="#e53935" />,
    info: <Info size={40} color="#1e88e5" />,
    warning: <AlertTriangle size={40} color="#f5a623" />,
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <motion.div
            className={`modal-container ${type}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="modal-icon">{iconMap[type]}</div>
            <h3>{title}</h3>
            <p>{message}</p>

            {(onConfirm || onCancel) && (
              <div className="modal-buttons">
                {onCancel && (
                  <button className="modal-button cancel" onClick={handleCancel}>
                    {cancelText}
                  </button>
                )}
                {onConfirm && (
                  <button className="modal-button confirm" onClick={handleConfirm}>
                    {confirmText}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalModal;
