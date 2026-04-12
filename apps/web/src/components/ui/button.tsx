import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded ${className} active:scale-[0.98] transition-transform duration-100 ease-in-out`}
    >
      {children}
    </button>
  );
};

export default Button;
