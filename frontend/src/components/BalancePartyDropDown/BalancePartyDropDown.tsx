import React, { useEffect, useRef, useState } from "react";
import type { BalancePartyType } from "../../types/vehicle";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectBalancePartyLoading } from "../../features/balanceParty/balancePartySelectors";
import {
  balancePartyFailure,
  balancePartyStart,
  balancePartySuccess,
} from "../../features/balanceParty";
import api from "../../api/axios";
import { addMessage } from "../../features/message";
import styles from './BalancePartyDropDown.module.scss';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface BalancePartyDropDownProps {
  balanceParty: BalancePartyType;
  balancePartyState: {
    localBalanceParty: BalancePartyType;
    drafts: Partial<BalancePartyType>;
    editing: Set<keyof BalancePartyType>;
    isOpen: boolean;
  };
  updateBalancePartyState: (id: string, newState: Partial<any>) => void;
  updateDraft: (id: string, key: keyof BalancePartyType, value: string) => void;
  toggleEditing: (id: string, key: keyof BalancePartyType) => void;
  toggleOpen: (id: string) => void;
  updateOriginalBalanceParty: (updatedBalanceParty: BalancePartyType) => void;
}

const dropDownVariants: Variants = {
  hidden: { height: 0 },
  visible: (height: number) => ({
    height,
    transition: { duration: 0.3, ease: "easeInOut" },
  }),
  exit: { height: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};

const BALANCE_PARTY_LABELS = {
    party_name: "Party Name"
}

const BalancePartyDropDown: React.FC<BalancePartyDropDownProps> = ({
  balanceParty,
  balancePartyState,
  updateBalancePartyState,
  updateDraft,
  toggleEditing,
  toggleOpen,
  updateOriginalBalanceParty,
}) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectBalancePartyLoading);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  });

  const handleEdit = (key: keyof BalancePartyType) => {
    toggleEditing(balanceParty._id, key);
    updateDraft(
      balanceParty._id,
      key,
      balancePartyState.localBalanceParty[key] ?? ""
    );
  };

  const handleCancel = (key: keyof BalancePartyType) => {
    toggleEditing(balanceParty._id, key);
    updateBalancePartyState(balanceParty._id, {
      drafts: { ...balancePartyState.drafts, [key]: undefined },
    });
  };

  const handleSave = (key: keyof BalancePartyType) => {
    const updatedValue = balancePartyState.drafts[key] ?? "";
    updateBalancePartyState(balanceParty._id, {
      localBalanceParty: {
        ...balancePartyState.localBalanceParty,
        [key]: updatedValue,
      },
    });
    toggleEditing(balanceParty._id, key);
    updateBalancePartyState(balanceParty._id, {
      drafts: { ...balancePartyState.drafts, [key]: undefined },
    });
  };

  const handleAbortChanges = () => {
    updateBalancePartyState(balanceParty._id, {
      localBalanceParty: { ...balanceParty },
      drafts: {},
      editing: new Set(),
    });
  };

  const handleSaveChanges = async () => {
    dispatch(balancePartyStart());
    try {
      await api.post(
        `/balance-party/${balanceParty._id}`,
        balancePartyState.localBalanceParty
      );
      updateOriginalBalanceParty(balancePartyState.localBalanceParty);
      dispatch(balancePartySuccess());
      dispatch(addMessage({ type: "success", text: "Balance Party Updated" }));
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors)
          .flat()
          .forEach((msg) => {
            dispatch(addMessage({ type: "error", text: String(msg) }));
          });
      }
      dispatch(balancePartyFailure());
    }
  };

  const hasChanges =
    JSON.stringify(balancePartyState.localBalanceParty) !==
    JSON.stringify(balanceParty);

  return     <div className={styles.container}>
      <button
        className={styles.header}
        onClick={() => toggleOpen(balanceParty._id)}
      >
        <div className={styles.title}>
          <span className={styles.headingLabel}>PARTY NAME:</span>
          <span className={styles.headingValue}>
            {balancePartyState.localBalanceParty.party_name || "—"}
          </span>
        </div>
        <span className={styles.icon}>
          {balancePartyState.isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>

      {hasChanges && (
        <div className={styles.saveChangesWrapper}>
          <button className={styles.saveChangesBtn} onClick={handleSaveChanges}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button className={styles.abortChanges} onClick={handleAbortChanges}>
            Abort Changes
          </button>
        </div>
      )}

      <AnimatePresence>
        {balancePartyState.isOpen && (
          <motion.div
            ref={contentRef}
            className={styles.content}
            variants={dropDownVariants}
            style={{ overflow: "hidden" }}
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={height}
          >
            <div className={styles.list}>
              {(
                Object.entries(BALANCE_PARTY_LABELS) as [
                  keyof BalancePartyType,
                  string
                ][]
              ).map(([key, label]) => {
                const isEditing = balancePartyState.editing.has(key);
                const value = isEditing
                  ? balancePartyState.drafts[key] ?? ""
                  : balancePartyState.localBalanceParty[key];

                return (
                  <div key={key} className={styles.row}>
                    <div className={styles.label}>{label}</div>

                    {isEditing ? (
                      <div className={styles.editArea}>
                        <input
                          className={styles.input}
                          value={value as string}
                          onChange={(e) =>
                            updateDraft(balanceParty._id, key, e.target.value)
                          }
                        />
                        <div className={styles.actions}>
                          <button
                            className={styles.saveBtn}
                            onClick={() => handleSave(key)}
                          >
                            Save
                          </button>
                          <button
                            className={styles.cancelBtn}
                            onClick={() => handleCancel(key)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.value}>{value as string}</div>
                    )}

                    <div className={styles.controls}>
                      {!isEditing && (
                        <button
                          className={styles.editBtn}
                          onClick={() => handleEdit(key)}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>;
};

export default BalancePartyDropDown;
