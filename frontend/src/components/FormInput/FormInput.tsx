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
  placeholder?: string;
  options?: string[];
  error?: string;
  icon?: React.ReactNode;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
  options = [],
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === "password";
  const isTextarea = type === "textarea";
  const isSelect = type === "select";
  const hasIcon = !!icon;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  console.log(icon);

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

        {isSelect ? (
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : isTextarea ? (
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
            className={hasIcon ? `${styles.withIcon}` : ""}
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
