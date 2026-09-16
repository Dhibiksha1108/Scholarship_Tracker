import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="card modal-content" role="dialog" aria-modal="true">
        <button onClick={onClose} className="modal-close" aria-label="Close modal">
          <X size={20} />
        </button>

        {title && <h2 className="modal-title mb-4">{title}</h2>}

        <div className="modal-body">{children}</div>
      </div>

      <style>{`
        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
          margin-right: 2rem;
        }
        .modal-body {
          padding-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default Modal;
