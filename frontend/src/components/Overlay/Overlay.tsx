// Overlay.tsx
import React, { type ReactNode } from "react";
import styles from "./Overlay.module.scss";
import { FaTimes } from "react-icons/fa";

type OverlayProps = {
  children: ReactNode;
  onCancel: () => void;
};

const Overlay: React.FC<OverlayProps> = ({ children, onCancel }) => {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.scrollable}>
          {children}
        </div>
        <button className={styles.closeBtn} onClick={onCancel}>
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default Overlay;
