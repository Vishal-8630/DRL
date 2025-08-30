import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { PARTY_LABELS, type BillingPartyType } from "../../types/party";
import styles from "./Party.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthLoading } from "../../features/auth/authSelectors";
import { partyFailure, partyStart, partySuccess } from "../../features/party";
import { addMessage } from "../../features/message";
import api from "../../api/axios";

interface PartyProps {
  party: BillingPartyType;
  partyState: {
    localParty: BillingPartyType;
    drafts: Partial<BillingPartyType>;
    editing: Set<keyof BillingPartyType>;
    isOpen: boolean;
  };
  updatePartyState: (partyId: string, newState: Partial<any>) => void;
  updateDraft: (partyId: string, key: keyof BillingPartyType, value: string) => void;
  toggleEditing: (partyId: string, key: keyof BillingPartyType) => void;
  toggleOpen: (partyId: string) => void;
  updateOriginalParty: (updatedParty: BillingPartyType) => void;
}

const Party: React.FC<PartyProps> = ({
  party,
  partyState,
  updatePartyState,
  updateDraft,
  toggleEditing,
  toggleOpen,
  updateOriginalParty
}) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);

  const handleEdit = (key: keyof BillingPartyType) => {
    toggleEditing(party._id, key);
    updateDraft(party._id, key, partyState.localParty[key] ?? "");
  };

  const handleCancel = (key: keyof BillingPartyType) => {
    toggleEditing(party._id, key);
    updatePartyState(party._id, {
      drafts: { ...partyState.drafts, [key]: undefined },
    });
  };

  const handleSave = (key: keyof BillingPartyType) => {
    const updatedValue = partyState.drafts[key] ?? "";
    updatePartyState(party._id, {
      localParty: { ...partyState.localParty, [key]: updatedValue },
    });
    toggleEditing(party._id, key);
    updatePartyState(party._id, {
      drafts: { ...partyState.drafts, [key]: undefined },
    });
  };

  const handleAbortChanges = () => {
    updatePartyState(party._id, {
      localParty: { ...party },
      drafts: {},
      editing: new Set(),
    });
  };

  const handleSaveChanges = async () => {
    dispatch(partyStart());
    try {
      await api.post(`/party/update-party/${party._id}`, partyState.localParty);
      dispatch(addMessage({ type: "success", text: "Entry Updated" }));
      dispatch(partySuccess());
      updateOriginalParty(partyState.localParty);
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors)
          .flat()
          .forEach((msg) => {
            dispatch(addMessage({ type: "error", text: String(msg) }));
          });
      }
      dispatch(partyFailure());
    }
  };

  const hasChanges =
    JSON.stringify(partyState.localParty) !== JSON.stringify(party);

  return (
    <div className={styles.container}>
      <button className={styles.header} onClick={() => toggleOpen(party._id)}>
        <div className={styles.title}>
          <span className={styles.headingLabel}>Billing Party Name</span>
          <span className={styles.headingValue}>
            {partyState.localParty.name || "—"}
          </span>
        </div>
        <span className={styles.icon}>
          {partyState.isOpen ? <FaChevronUp /> : <FaChevronDown />}
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

      {partyState.isOpen && (
        <div className={styles.content}>
          <div className={styles.list}>
            {(
              Object.entries(PARTY_LABELS) as [keyof BillingPartyType, string][]
            ).map(([key, label]) => {
              const isEditing = partyState.editing.has(key);
              const value = isEditing
                ? partyState.drafts[key] ?? ""
                : partyState.localParty[key] ?? "—";

              return (
                <div key={key} className={styles.row}>
                  <div className={styles.label}>{label}</div>

                  {isEditing ? (
                    <div className={styles.editArea}>
                      <input
                        className={styles.input}
                        value={value as string}
                        onChange={(e) =>
                          updateDraft(party._id, key, e.target.value)
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
                    <div className={styles.value}>{value}</div>
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
        </div>
      )}
    </div>
  );
};

export default Party;