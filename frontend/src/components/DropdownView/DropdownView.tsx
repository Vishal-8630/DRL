import React, { useEffect, useState } from "react";
import styles from "./DropdownView.module.scss";
import {
  ENTRY_LABELS,
  EXTRA_CHARGE_LABELS,
  type EntryType,
  type ExtraCharge,
} from "../../types/entry";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { entryFailure, entryStart, entrySuccess } from "../../features/entry";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { addMessage } from "../../features/message";
import api from "../../api/axios";
import { PARTY_LABELS, type BillingPartyType } from "../../types/party";
import { formatDate } from "../../utils/formatDate";

interface DropdownViewProps {
  entry: EntryType;
  onUpdate: (updatedEntry: EntryType) => void;
}

const DropdownView: React.FC<DropdownViewProps> = ({ entry, onUpdate }) => {
  const [localEntry, setLocalEntry] = useState(entry);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<{
    fields: Set<keyof EntryType>;
    extra_charges: Set<string>;
  }>({
    fields: new Set(),
    extra_charges: new Set(),
  });
  const [drafts, setDrafts] = useState<{
    fields: Partial<EntryType>;
    extra_charges: Record<string, Partial<ExtraCharge>>;
  }>({
    fields: {},
    extra_charges: {},
  });

  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.entry);

  const isKeyDate = (key: keyof EntryType) =>
    key.toLowerCase().includes("date");

  const handleEdit = (key: keyof EntryType) => {
    setEditing((prev) => ({
      ...prev,
      fields: new Set(prev.fields).add(key),
    }));
    setDrafts((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]:
          isKeyDate(key) && typeof localEntry[key] === "string"
            ? formatDate(new Date(localEntry[key]))
            : localEntry[key] ?? "",
      },
    }));
  };

  useEffect(() => {
    setLocalEntry(entry);
    setDrafts({ fields: {}, extra_charges: {} });
    setEditing({ fields: new Set(), extra_charges: new Set() });
  }, [entry]);

  const handleExtraChargeEdit = (id: string, key: keyof ExtraCharge) => {
    setEditing((prev) => ({
      ...prev,
      extra_charges: new Set(prev.extra_charges).add(`${id}.${key}` as any),
    }));
    setDrafts((prev) => {
      const updated = { ...prev.extra_charges };

      if (!updated[id]) updated[id] = {} as Partial<ExtraCharge>;

      updated[id] = {
        ...updated[id],
        [key]:
          localEntry.extra_charges?.find((ch) => ch._id === id)?.[key] ?? "",
      };

      return {
        ...prev,
        extra_charges: updated,
      };
    });
  };

  const handleSave = (key: keyof EntryType) => {
    setLocalEntry((prev) => ({
      ...prev,
      [key]: drafts.fields[key],
    }));

    setEditing((prev) => ({
      ...prev,
      fields: new Set([...prev.fields].filter((k) => k !== key)),
    }));

    setDrafts((prev) => {
      const { [key]: _, ...rest } = prev.fields;
      return {
        ...prev,
        fields: rest,
      };
    });
  };

  const handleExtraChargeSave = (id: string, key: keyof ExtraCharge) => {
    setLocalEntry((prev) => ({
      ...prev,
      extra_charges: prev.extra_charges.map((charge) =>
        charge._id === id
          ? {
              ...charge,
              [key]: drafts.extra_charges?.[id]?.[key] ?? charge[key],
            }
          : charge
      ),
    }));

    setEditing((prev) => ({
      ...prev,
      extra_charges: new Set(
        [...prev.extra_charges].filter((k) => k !== `${id}.${key}`)
      ),
    }));

    setDrafts((prev) => {
      const updated = { ...prev.extra_charges };

      if (updated[id]) {
        const { [key]: _, ...rest } = updated[id];

        if (Object.keys(rest).length === 0) {
          delete updated[id];
        } else {
          updated[id] = rest;
        }
      }

      return {
        ...prev,
        extra_charges: updated,
      };
    });
  };

  const handleCancel = (key: keyof EntryType) => {
    setEditing((prev) => ({
      ...prev,
      fields: new Set([...prev.fields].filter((k) => k !== key)),
    }));

    setDrafts((prev) => {
      const { [key]: _, ...rest } = prev.fields;
      return {
        ...prev,
        fields: rest,
      };
    });
  };

  const handleExtraChargeCancel = (id: string, key: keyof ExtraCharge) => {
    setEditing((prev) => ({
      ...prev,
      extra_charges: new Set(
        [...prev.extra_charges].filter((k) => k !== `${id}.${key}`)
      ),
    }));

    setDrafts((prev) => {
      const updated = { ...prev.extra_charges };

      if (updated[id]) {
        const { [key]: _, ...rest } = updated[id];
        if (Object.keys(rest).length > 0) {
          updated[id] = rest;
        } else {
          delete updated[id];
        }
      }

      return {
        ...prev,
        extra_charges: updated,
      };
    });
  };

  const addNewCharge = () => {
    const newId = crypto.randomUUID();
    const newCharge: ExtraCharge = {
      _id: newId,
      type: "",
      rate: "",
      amount: "",
      per_amount: "",
    };

    setLocalEntry((prev) => ({
      ...prev,
      extra_charges: [...(prev.extra_charges ?? []), newCharge],
    }));

    setEditing((prev) => ({
      ...prev,
      extra_charges: new Set([...prev.extra_charges, `${newId}.type`]),
    }));
  };

  const handleExtraChargeDelete = (_id: string) => {
    setLocalEntry((prev) => ({
      ...prev,
      extra_charges: prev.extra_charges.filter((charge) => charge._id !== _id),
    }));

    setDrafts((prev) => {
      const updated = { ...prev.extra_charges };
      delete updated[_id];
      return { ...prev, extra_charges: updated };
    });

    setEditing((prev) => {
      const updated = new Set(
        [...prev.extra_charges].filter((k) => !k.startsWith(_id))
      );
      return { ...prev, extra_charges: updated };
    });
  };

  const handleAbortChanges = () => {
    setLocalEntry(entry);
    setDrafts({
      fields: {},
      extra_charges: {},
    });
    setEditing({
      fields: new Set(),
      extra_charges: new Set(),
    });
  };

  const handleSaveChanges = async () => {
    dispatch(entryStart());
    try {
      const response = await api.post(
        `/entry/update-entry/${entry._id}`,
        localEntry
      );
      const obj = response.data;
      setLocalEntry(obj.data);
      onUpdate(obj.data);
      dispatch(entrySuccess());
      dispatch(
        addMessage({ type: "success", text: obj.message || "Entry Updated" })
      );
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors)
          .flat()
          .forEach((msg) => {
            dispatch(addMessage({ type: "error", text: String(msg) }));
          });
      }
      dispatch(entryFailure());
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.header} onClick={() => setIsOpen((s) => !s)}>
        <div className={styles.title}>
          <span className={styles.headingLabel}>Vehicle No</span>
          <span className={styles.headingValue}>
            {localEntry.vehicle_no || "—"}
          </span>
        </div>
        <span className={styles.icon}>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>

      {JSON.stringify(localEntry) !== JSON.stringify(entry) && (
        <div className={styles.saveChangesWrapper}>
          <button className={styles.saveChangesBtn} onClick={handleSaveChanges}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button className={styles.abortChanges} onClick={handleAbortChanges}>
            Abort Changes
          </button>
        </div>
      )}

      <div className={styles.content}>
        {isOpen && (
          <div className={styles.list}>
            {(Object.entries(ENTRY_LABELS) as [keyof EntryType, string][]).map(
              ([k, value]) => {
                const key = k as keyof EntryType;
                if (key === "extra_charges") {
                  return (
                    <div key={key} className={styles.extraChargesSection}>
                      <div className={styles.chargeTitle}>Extra Charges</div>
                      {(localEntry.extra_charges ?? []).map((charge) => {
                        return (
                          <div className={styles.chargeSection}>
                            {Object.entries(charge as ExtraCharge).map(
                              ([subKey, subValue]) =>
                                subKey !== "_id" ? (
                                  <div
                                    key={`${charge._id}-${subKey}`}
                                    className={styles.row}
                                  >
                                    <div className={styles.label}>
                                      {EXTRA_CHARGE_LABELS[subKey]}
                                    </div>

                                    {editing.extra_charges.has(
                                      `${charge._id}.${subKey}`
                                    ) ? (
                                      <div className={styles.editArea}>
                                        <input
                                          className={styles.input}
                                          value={
                                            drafts.extra_charges?.[
                                              charge._id
                                            ]?.[subKey as keyof ExtraCharge] ??
                                            subValue ??
                                            ""
                                          }
                                          onChange={(e) =>
                                            setDrafts((d) => ({
                                              ...d,
                                              extra_charges: {
                                                ...(d.extra_charges ?? {}),
                                                [charge._id]: {
                                                  ...(d.extra_charges?.[
                                                    charge._id
                                                  ] ?? {}),
                                                  [subKey]: e.target.value,
                                                },
                                              },
                                            }))
                                          }
                                        />
                                        <div className={styles.actions}>
                                          <button
                                            className={styles.saveBtn}
                                            onClick={() =>
                                              handleExtraChargeSave(
                                                charge._id,
                                                subKey as keyof ExtraCharge
                                              )
                                            }
                                          >
                                            Save
                                          </button>
                                          <button
                                            className={styles.cancelBtn}
                                            onClick={() =>
                                              handleExtraChargeCancel(
                                                charge._id,
                                                subKey as keyof ExtraCharge
                                              )
                                            }
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className={styles.value}>
                                        {subValue || ""}
                                      </div>
                                    )}

                                    <div className={styles.controls}>
                                      {!editing.extra_charges.has(
                                        `${charge._id}.${subKey}`
                                      ) && (
                                        <button
                                          className={styles.editBtn}
                                          onClick={() =>
                                            handleExtraChargeEdit(
                                              charge._id,
                                              subKey as keyof ExtraCharge
                                            )
                                          }
                                        >
                                          Edit
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ) : null
                            )}
                            <div className={styles.deleteSection}>
                              <button
                                className={styles.deleteBtn}
                                onClick={() =>
                                  handleExtraChargeDelete(charge._id)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {/* Add Extra Charge Button */}
                      <div className={styles.addExtraCharge}>
                        <button
                          className={styles.addBtn}
                          onClick={addNewCharge}
                        >
                          ➕ Add Extra Charge
                        </button>
                      </div>
                    </div>
                  );
                }

                if (key === "billing_party") {
                  return (
                    Object.entries(PARTY_LABELS) as [
                      keyof BillingPartyType,
                      string
                    ][]
                  ).map(([subKey, subValue]) => (
                    <div key={`${subKey}-${subValue}`} className={styles.row}>
                      <div className={styles.label}>{subValue}</div>
                      <div className={styles.value}>
                        {localEntry[key][subKey]}
                      </div>
                    </div>
                  ));
                }

                return (
                  <div key={key} className={styles.row}>
                    <div className={styles.label}>{value}</div>

                    {editing.fields.has(key) ? (
                      <div className={styles.editArea}>
                        <input
                          className={styles.input}
                          value={(drafts.fields[key] as string) ?? ""}
                          onChange={(e) =>
                            setDrafts((d) => ({
                              ...d,
                              fields: {
                                ...d.fields,
                                [key]: e.target.value,
                              },
                            }))
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
                      <div className={styles.value}>
                        {isKeyDate(key)
                          ? formatDate(new Date(localEntry[key]))
                          : localEntry[key]}
                      </div>
                    )}

                    <div className={styles.controls}>
                      {!editing.fields.has(key) && (
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
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownView;
