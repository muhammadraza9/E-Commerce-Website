import { toast } from "react-toastify";

const baseStyle = {
  background: "#0B1F33",
  border: "1px solid #D4AF37",
  borderRadius: "12px",
  boxShadow: "0 8px 24px rgba(212,175,55,0.15)",
};

const TOAST_DURATION = 1000; // 1 Second

export const showSuccessToast = (message) => {
  toast(
    <div className="flex items-center gap-2">
      <span className="text-[#D4AF37] text-lg">✓</span>
      <p className="text-white text-sm font-medium">{message}</p>
    </div>,
    {
      position: "top-right",
      autoClose: TOAST_DURATION,
      closeButton: false,
      icon: false,
      hideProgressBar: false,
      pauseOnHover: false,
      draggable: false,
      style: baseStyle,
      progressStyle: {
        background: "#D4AF37",
      },
    }
  );
};

export const showErrorToast = (message) => {
  toast(
    <div className="flex items-center gap-2">
      <span className="text-red-400 text-lg">✕</span>
      <p className="text-white text-sm font-medium">{message}</p>
    </div>,
    {
      position: "top-right",
      autoClose: TOAST_DURATION,
      closeButton: false,
      icon: false,
      hideProgressBar: false,
      pauseOnHover: false,
      draggable: false,
      style: {
        ...baseStyle,
        border: "1px solid #ef4444",
      },
      progressStyle: {
        background: "#ef4444",
      },
    }
  );
};

export const showInfoToast = (message) => {
  toast(
    <div className="flex items-center gap-2">
      <span className="text-blue-300 text-lg">ℹ</span>
      <p className="text-white text-sm font-medium">{message}</p>
    </div>,
    {
      position: "top-right",
      autoClose: TOAST_DURATION,
      closeButton: false,
      icon: false,
      hideProgressBar: false,
      pauseOnHover: false,
      draggable: false,
      style: {
        ...baseStyle,
        border: "1px solid #60a5fa",
      },
      progressStyle: {
        background: "#60a5fa",
      },
    }
  );
};

export const showCartToast = (product) => {
  toast(
    <div className="flex items-center gap-3">
      <img
        src={product.image}
        alt={product.name}
        className="w-12 h-12 object-cover rounded-md border border-[#D4AF37]/50"
      />

      <div>
        <p className="text-white font-semibold text-sm leading-tight">
          {product.name}
        </p>

        <p className="text-[#D4AF37] text-xs mt-0.5">
          ✓ Added to cart
        </p>
      </div>
    </div>,
    {
      position: "top-right",
      autoClose: TOAST_DURATION,
      closeButton: false,
      icon: false,
      hideProgressBar: false,
      pauseOnHover: false,
      draggable: false,
      style: baseStyle,
      progressStyle: {
        background: "#D4AF37",
      },
    }
  );
};