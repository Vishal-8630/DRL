import React, { type ReactNode } from "react";
import { motion } from "framer-motion";
import styles from "./FormSection.module.scss";

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  return (
    <motion.div
      className={styles.formSection}
      drag
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      initial={{ opacity: 0, y: 150, rotateX: -30 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      whileHover={{ scale: 1.02, rotateY: 15, rotateX: 5 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className={styles.sectionTitle}>{title}</div>
      {children}
    </motion.div>
  );
};

export default FormSection;