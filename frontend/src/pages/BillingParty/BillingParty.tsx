import { useEffect, useState } from "react";
import styles from "./BillingParty.module.scss";
import BillingPartyForm from "../../components/BillingPartyForm";
import Party from "../../components/Party";
import { useSelector, useDispatch } from "react-redux";
import { selectPartyLoading } from "../../features/party/partySelectros";
import Loading from "../../components/Loading";
import type { BillingPartyType } from "../../types/party";
import { partyFailure, partyStart, partySuccess } from "../../features/party";
import api from "../../api/axios";
import { addMessage } from "../../features/message";

/* -------------------- Constants -------------------- */
export const TABS = {
  LIST: "list",
  FORM: "form",
} as const;

type ActiveTab = (typeof TABS)[keyof typeof TABS];

/* -------------------- Types -------------------- */
type PartyState = {
  localParty: BillingPartyType;              // Local copy of party
  drafts: Partial<BillingPartyType>;         // Draft values while editing
  editing: Set<keyof BillingPartyType>;      // Currently editing fields
  isOpen: boolean;                           // Expand/collapse flag
};

const BillingParty = () => {
  /* -------------------- Redux -------------------- */
  const loading = useSelector(selectPartyLoading);
  const dispatch = useDispatch();

  /* -------------------- Local State -------------------- */
  const [activeTab, setActiveTab] = useState<ActiveTab>(TABS.LIST);

  // "Add Party" form state
  const [party, setParty] = useState<BillingPartyType>({
    _id: "",
    name: "",
    address: "",
    gst_no: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [parties, setParties] = useState<BillingPartyType[]>([]);

  // State management for each Party component
  const [partyStates, setPartyStates] = useState<Record<string, PartyState>>({});

  /* -------------------- Effects -------------------- */

  // Fetch all parties whenever tab changes (mainly when switching back to LIST)
  useEffect(() => {
    const fetchAllParties = async () => {
      try {
        const response = await api.get("/party/all-parties");
        const data: BillingPartyType[] = response.data.data;
        setParties(data);

        // Initialize per-party state
        const initialStates: Record<string, PartyState> = {};
        data.forEach((p) => {
          initialStates[p._id] = {
            localParty: { ...p },
            drafts: {},
            editing: new Set(),
            isOpen: false,
          };
        });
        setPartyStates(initialStates);
      } catch (error: any) {
        console.error("Failed to fetch parties", error.response);
      }
    };

    fetchAllParties();
  }, [activeTab]);

  /* -------------------- Handlers: Add Party -------------------- */

  // Handle input change in Add Party form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear error for current field
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setParty((prev) => ({ ...prev, [name]: value }));
  };

  // Submit new party
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(partyStart());

    try {
      const response = await api.post("/party/add-party", party);

      // Success message
      dispatch(addMessage({ type: "success", text: response.data.message }));

      // Reset form and return to list
      setParty({ _id: "", name: "", address: "", gst_no: "" });
      setActiveTab(TABS.LIST);

      dispatch(partySuccess());
    } catch (error: any) {
      const errorObj = error.response?.data?.errors;
      if (errorObj) setErrors(errorObj);
      dispatch(partyFailure());
    }
  };

  /* -------------------- Handlers: Party State Management -------------------- */

  // Update full party state
  const updatePartyState = (
    partyId: string,
    newState: Partial<PartyState>
  ) => {
    setPartyStates((prev) => ({
      ...prev,
      [partyId]: { ...prev[partyId], ...newState },
    }));
  };

  // Update a single draft field
  const updateDraft = (
    partyId: string,
    key: keyof BillingPartyType,
    value: string
  ) => {
    setPartyStates((prev) => ({
      ...prev,
      [partyId]: {
        ...prev[partyId],
        drafts: { ...prev[partyId].drafts, [key]: value },
      },
    }));
  };

  // Toggle editing mode for a specific field
  const toggleEditing = (partyId: string, key: keyof BillingPartyType) => {
    setPartyStates((prev) => {
      const editing = new Set(prev[partyId].editing);
      if (editing.has(key)) editing.delete(key);
      else editing.add(key);
      return { ...prev, [partyId]: { ...prev[partyId], editing } };
    });
  };

  // Expand / collapse a party block
  const toggleOpen = (partyId: string) => {
    setPartyStates((prev) => ({
      ...prev,
      [partyId]: { ...prev[partyId], isOpen: !prev[partyId].isOpen },
    }));
  };

  // Update parties array after successful update
  const updateOriginalParty = (updatedParty: BillingPartyType) => {
    setParties((prev) =>
      prev.map((party) =>
        party._id === updatedParty._id ? updatedParty : party
      )
    );
  };

  /* -------------------- Render -------------------- */

  if (loading) return <Loading />;

  return (
    <div className={styles.partyContainer}>
      {/* Tab Switcher */}
      <div className={styles.buttonGroup}>
        <button onClick={() => setActiveTab(TABS.FORM)}>Add Billing Party</button>
        <button onClick={() => setActiveTab(TABS.LIST)}>View Billing Parties</button>
      </div>

      {/* Frame Container */}
      <div className={styles.frameContainer}>
        {/* Add Party Form */}
        {activeTab === TABS.FORM && (
          <BillingPartyForm
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            party={party}
            errors={errors}
          />
        )}

        {/* Party List */}
        {activeTab === TABS.LIST &&
          parties.map((p) => (
            <Party
              key={p._id}
              party={p}
              partyState={partyStates[p._id]}
              updatePartyState={updatePartyState}
              updateDraft={updateDraft}
              toggleEditing={toggleEditing}
              toggleOpen={toggleOpen}
              updateOriginalParty={updateOriginalParty}
            />
          ))}
      </div>
    </div>
  );
};

export default BillingParty;