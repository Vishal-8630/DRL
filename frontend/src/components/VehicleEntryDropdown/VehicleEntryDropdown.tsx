import React, { useEffect, useRef, useState } from "react";
import {
  VEHICLE_ENTRY_LABELS,
  type VehicleEntryType,
} from "../../types/vehicle";
import { useDispatch } from "react-redux";
import { selectVehicleLoading } from "../../features/vehicle/vehicleSelectors";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import {
  vehicleFailure,
  vehicleStart,
  vehicleSuccess,
} from "../../features/vehicle";
import { addMessage } from "../../features/message";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import styles from "./VehicleEntryDropdown.module.scss";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { formatDate } from "../../utils/formatDate";

interface VehicleEntryDropdownProps {
  vehicleEntry: VehicleEntryType;
  vehicleState: {
    localVehicleEntry: VehicleEntryType;
    drafts: Partial<VehicleEntryType>;
    editing: Set<keyof VehicleEntryType>;
    isOpen: boolean;
  };
  updateVehicleState: (id: string, newState: Partial<any>) => void;
  updateDraft: (id: string, key: keyof VehicleEntryType, value: string) => void;
  toggleEditing: (id: string, key: keyof VehicleEntryType) => void;
  toggleOpen: (id: string) => void;
  updateOriginalVehicleEntry: (updatedVehicleEntry: VehicleEntryType) => void;
}

const dropDownVariants: Variants = {
  hidden: { height: 0 },
  visible: (height: number) => ({
    height,
    transition: { duration: 0.3, ease: "easeInOut" },
  }),
  exit: { height: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};

const VehicleEntryDropdown: React.FC<VehicleEntryDropdownProps> = ({
  vehicleEntry,
  vehicleState,
  updateVehicleState,
  updateDraft,
  toggleEditing,
  toggleOpen,
  updateOriginalVehicleEntry,
}) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectVehicleLoading);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const isKeyDate = (key: keyof VehicleEntryType) =>
    key.toLowerCase().includes("date");

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  });

  const handleEdit = (key: keyof VehicleEntryType) => {
    toggleEditing(vehicleEntry._id, key);
    updateDraft(
      vehicleEntry._id,
      key,
      (vehicleState.localVehicleEntry[key] as string) ?? ""
    );
  };

  const handleCancel = (key: keyof VehicleEntryType) => {
    toggleEditing(vehicleEntry._id, key);
    updateVehicleState(vehicleEntry._id, {
      drafts: { ...vehicleState.drafts, [key]: undefined },
    });
  };

  const handleSave = (key: keyof VehicleEntryType) => {
    const updatedValue = vehicleState.drafts[key] ?? "";
    updateVehicleState(vehicleEntry._id, {
      localVehicleEntry: {
        ...vehicleState.localVehicleEntry,
        [key]: updatedValue,
      },
    });
    toggleEditing(vehicleEntry._id, key);
    updateVehicleState(vehicleEntry._id, {
      drafts: { ...vehicleState.drafts, [key]: undefined },
    });
  };

  const handleAbortChanges = () => {
    updateVehicleState(vehicleEntry._id, {
      localVehicleEntry: { ...vehicleEntry },
      drafts: {},
      editing: new Set(),
    });
  };

  const handleSaveChanges = async () => {
    dispatch(vehicleStart());
    try {
      const { data } = await api.post(
        `/vehicle-entry/update-vehicle-entry/${vehicleEntry._id}`,
        vehicleState.localVehicleEntry
      );
      updateOriginalVehicleEntry(data.data);
      dispatch(vehicleSuccess());
      dispatch(addMessage({ type: "success", text: "Vehicle Entry Updated" }));
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors)
          .flat()
          .forEach((msg) => {
            dispatch(addMessage({ type: "error", text: String(msg) }));
          });
      }
      dispatch(vehicleFailure());
    }
  };

  // useEffect(() => {
  //   if (vehicleEntry.from.includes("Agra")) {
  //     console.log("Vehicle Entry: ", vehicleEntry, "Vehicle Local Entry: ", vehicleState.localVehicleEntry);
  //     console.log(JSON.stringify(vehicleEntry) === JSON.stringify(vehicleState.localVehicleEntry));
  //     console.log("Vehicle Entry: ", JSON.stringify(vehicleEntry));
  //     console.log("Vehicle Local Entry: ", JSON.stringify(vehicleState.localVehicleEntry));
  //   }
  // }, []);

  const hasChanges =
    JSON.stringify(vehicleState.localVehicleEntry) !==
    JSON.stringify(vehicleEntry);

  return (
    <div className={styles.container}>
      <button
        className={styles.header}
        onClick={() => toggleOpen(vehicleEntry._id)}
      >
        <div className={styles.title}>
          <span className={styles.headingLabel}>Date: </span>
          <span className={styles.headingValue}>
            {formatDate(new Date(vehicleState.localVehicleEntry.date)) || "—"}
          </span>
          <span>|</span>
          <span className={styles.headingLabel}>Vehicle Number:</span>
          <span className={styles.headingValue}>
            {vehicleState.localVehicleEntry.vehicle_no || "—"}
          </span>
          <span>|</span>
          <span className={styles.headingLabel}>From:</span>
          <span className={styles.headingValue}>
            {vehicleState.localVehicleEntry.from || "—"}
          </span>
          <span>|</span>
          <span className={styles.headingLabel}>To: </span>
          <span className={styles.headingValue}>
            {vehicleState.localVehicleEntry.to || "—"}
          </span>
        </div>
        <span className={styles.icon}>
          {vehicleState.isOpen ? <FaChevronUp /> : <FaChevronDown />}
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
        {vehicleState.isOpen && (
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
                Object.entries(VEHICLE_ENTRY_LABELS) as [
                  keyof VehicleEntryType,
                  string
                ][]
              ).map(([key, label]) => {
                const isEditing = vehicleState.editing.has(key);
                const isBalanceParty = (key as string) === "balance_party";
                const value = isEditing
                  ? vehicleState.drafts[key] ?? ""
                  : isBalanceParty
                  ? vehicleState.localVehicleEntry["balance_party"].party_name
                  : isKeyDate(key)
                  ? formatDate(new Date(vehicleState.localVehicleEntry[key] as string))
                  : vehicleState.localVehicleEntry[key] ?? "—";

                return (
                  <div key={key} className={styles.row}>
                    <div className={styles.label}>{label}</div>

                    {isEditing ? (
                      <div className={styles.editArea}>
                        <input
                          className={styles.input}
                          value={value as string}
                          onChange={(e) =>
                            updateDraft(vehicleEntry._id, key, e.target.value)
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
                      {!isEditing && !isBalanceParty && (
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
    </div>
  );
};

export default VehicleEntryDropdown;
