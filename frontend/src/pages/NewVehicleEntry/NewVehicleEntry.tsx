import React, { useEffect, useRef, useState } from "react";
import {
  EmptyVehicleEntry,
  type BalancePartyType,
  type VehicleEntryType,
} from "../../types/vehicle";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectVehicleLoading } from "../../features/vehicle/vehicleSelectors";
import Loading from "../../components/Loading";
import {
  vehicleFailure,
  vehicleStart,
  vehicleSuccess,
} from "../../features/vehicle";
import { addMessage } from "../../features/message";
import api from "../../api/axios";
import FormInput from "../../components/FormInput";
import styles from "./NewVehicleEntry.module.scss";
import FormSection from "../../components/FormSection";
import { useNavigate } from "react-router-dom";

interface InputType {
  type: string;
  label: string;
  name: string;
  options?: string[];
}
type Option = { label: string; value: string };

const VEHICLE_INPUTS: InputType[] = [
  { type: "select", label: "Movement Type", name: "movementType" },
  { type: "date", label: "Date", name: "date" },
  { type: "input", label: "Vehicle No.", name: "vehicle_no" },
  { type: "textarea", label: "From", name: "from" },
  { type: "textarea", label: "To", name: "to" },
];

const BALANCE_INPUTS: InputType[] = [
  { type: "number", label: "Freight", name: "freight" },
  { type: "number", label: "Driver Cash", name: "driver_cash" },
  { type: "number", label: "Dala", name: "dala" },
  { type: "number", label: "Kamisan", name: "kamisan" },
  { type: "number", label: "In AC", name: "in_ac" },
  { type: "number", label: "Halting", name: "halting" },
  { type: "number", label: "Balance", name: "balance" },
];

const PARTY_DETAIL: InputType[] = [
  { type: "select", label: "Party Name", name: "party_name" },
  { type: "input", label: "Owner", name: "owner" },
  {
    name: "status",
    label: "Status",
    type: "select",
  },
];

const NewVehicleEntry = () => {
  const [vehicleEntry, setVehicleEntry] =
    useState<VehicleEntryType>(EmptyVehicleEntry);
  const [balanceParties, setBalanceParties] = useState<BalancePartyType[]>([]);
  const [selectedBalanceParty, setSelectedBalanceParty] =
    useState<BalancePartyType>({
      _id: "",
      party_name: "",
    });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const errorsRef = useRef(errors);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectVehicleLoading);

  useEffect(() => {
    const fetchAllBalanceParties = async () => {
      try {
        const { data } = await api.get("/balance-party/all-balance-parties");
        setBalanceParties(data.data);
      } catch (error: any) {
        dispatch(addMessage({ type: "error", text: error.response?.data?.message }));
      }
    };
    fetchAllBalanceParties();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "party_name") {
      if (!value) {
        setVehicleEntry((prev) => ({
          ...prev,
          balance_party: { _id: "", party_name: "" },
        }));
        return;
      } else {
        const party = balanceParties.find((p) => p.party_name === value)!;
        setVehicleEntry((prev) => ({
          ...prev,
          balance_party: party,
        }));
      }
      return;
    }
    if (errorsRef.current[name]) {
      errorsRef.current[name] = "";
      setErrors({ ...errorsRef.current });
    }
    setVehicleEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    val: string,
    name: string,
    mode: "select" | "search"
  ) => {
    if (mode === "select") {
      setVehicleEntry((prev) => ({ ...prev, [name]: val }));
    } else {
      if (val === "") {
        setSelectedBalanceParty({ _id: "", party_name: "" });
      } else {
        const party = balanceParties.find((p) => p.party_name === val)!;
        setVehicleEntry((prev) => ({ ...prev, balance_party: party }));
      }
    }
  };

  const fetchOptions = async (search: string): Promise<Option[]> => {
    const fetchedBalanceParties = balanceParties.filter(
      (party) =>
        party.party_name &&
        party.party_name
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase())
    );
    if (fetchedBalanceParties.length > 0) {
      const options: Option[] = fetchedBalanceParties.map((party) => ({
        label: party.party_name,
        value: party.party_name,
      }));
      return options;
    } else return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(vehicleStart());
    try {
      const response = await api.post(
        "/vehicle-entry/new-vehicle-entry",
        vehicleEntry
      );
      dispatch(addMessage({ type: "success", text: response.data.message }));
      dispatch(vehicleSuccess());
      navigate("/vehicle-entry/all-vehicle-entries");
    } catch (error: any) {
      const errorsObj = error.response?.data?.errors || {};
      Object.entries(errorsObj).forEach(([key, value]) => {
        errorsRef.current[key] = value as string;
      });
      setErrors({ ...errorsRef.current });
      dispatch(
        addMessage({
          type: "error",
          text:
            Object.keys(errorsObj).length > 0
              ? "Please fill all the required fields"
              : error.response?.data?.message
              ? error.response?.data?.message
              : "New Entry Creation Failed",
        })
      );
      dispatch(vehicleFailure());
    }
  };

  const renderInputs = (inputs: InputType[]) => {
    return inputs.map((input) => {
      let options: Option[] = [];
      let selectMode: "select" | "search" = "select";
      let value: string = String(
        vehicleEntry[input.name as keyof VehicleEntryType] || ""
      );
      let placeholder: string = input.label;

      if (input.name === "status") {
        options = [
          { label: "Pending", value: "Pending" },
          { label: "Recieved", value: "Recieved" },
        ];
        value = vehicleEntry.status;
        placeholder = "";
      }

      if (input.name === "movementType") {
        options = [
          { label: "From DRL", value: "From DRL" },
          { label: "To DRL", value: "To DRL" },
        ];
        value = vehicleEntry.movementType;
        placeholder = "";
      }

      if (input.name === "party_name") {
        options = [];
        value = vehicleEntry.balance_party.party_name;
        placeholder = "Select a Balance Party";
        selectMode = "search";
      }

      return (
        <FormInput
          key={input.name}
          type={input.type}
          id={input.name}
          label={input.label}
          name={input.name}
          value={value}
          placeholder={placeholder}
          selectMode={selectMode}
          options={options}
          error={errorsRef.current[input.name]}
          onChange={handleChange}
          onSelectChange={handleSelectChange}
          fetchOptions={fetchOptions}
        />
      );
    });
  };

  if (loading) return <Loading />;

  return (
    <div className={styles.vehicleFormContainer}>
      <form className={styles.vehicleForm} onSubmit={handleSubmit}>
        <div className={styles.inputArea}>
          <FormSection title="Vehicle Details">
            {renderInputs(VEHICLE_INPUTS)}
          </FormSection>
          <FormSection title="Balance">
            {renderInputs(BALANCE_INPUTS)}
          </FormSection>
          <FormSection title="Party Details">
            {renderInputs(PARTY_DETAIL)}
          </FormSection>
        </div>
        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            Add Vehicle Entry
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewVehicleEntry;
