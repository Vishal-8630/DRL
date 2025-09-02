import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./FormInput.module.scss";

interface FormInputProps {
  type: string;
  label: string;
  id: string;
  name: string;
  value: string;
  placeholder: string;
  error?: string;
  icon?: React.ReactNode;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const FormInput: React.FC<FormInputProps> = ({
  type,
  label,
  id,
  name,
  value,
  placeholder,
  error,
  icon,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === "password";
  const isTextarea = type === "textarea";

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className={styles.formGroup}>
      <label htmlFor={id}>{label}</label>

      <motion.div
        className={styles.inputWrapper}
        animate={{ scale: isFocused ? 1.05 : 1 }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        {icon && <span className={styles.icon}>{icon}</span>}

        {isTextarea ? (
          <textarea
            id={id}
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        ) : (
          <input
            type={isPassword ? (showPassword ? "text" : "password") : type}
            id={id}
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        )}

        {isPassword && (
          <span
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        )}
      </motion.div>

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default FormInput;