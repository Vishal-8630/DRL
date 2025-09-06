import React, { useEffect, useRef, useState, type RefObject } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import api from "../../api/axios";
import { entryStart, entrySuccess, entryFailure } from "../../features/entry";
import { partyFailure, partyStart, partySuccess } from "../../features/party";
import { addMessage } from "../../features/message";

import type { RootState } from "../../app/store";
import {
  EXTRA_CHARGE_LABELS,
  type EntryType,
  type ExtraCharge,
} from "../../types/entry";
import type { BillingPartyType } from "../../types/party";

import styles from "./NewBillingEntry.module.scss";
import FormInput from "../../components/FormInput";
import FormSection from "../../components/FormSection";

/** -------------------- Form Sections Constants -------------------- **/
interface InputType {
  type: string;
  label: string;
  name: string;
  options?: string[];
}

type Option = { label: string; value: string };

const BILL_INFO_INPUTS: InputType[] = [
  { type: "number", label: "Bill No.", name: "bill_no" },
  { type: "date", label: "Bill Date", name: "bill_date" },
  { type: "select", label: "Billing Party", name: "billing_party" },
];

const LR_INFO_INPUTS: InputType[] = [
  { type: "number", label: "LR No.", name: "lr_no" },
  { type: "date", label: "LR Date", name: "lr_date" },
];

const CONSIGNOR_INPUTS: InputType[] = [
  { type: "input", label: "Consignor Name", name: "consignor_name" },
  {
    type: "textarea",
    label: "Consignor From Address",
    name: "consignor_from_address",
  },
  { type: "textarea", label: "Consignor GST No.", name: "consignor_gst_no" },
];

const CONSIGNEE_INPUTS: InputType[] = [
  { type: "input", label: "Consignee Name", name: "consignee" },
  {
    type: "textarea",
    label: "Consignee Address",
    name: "consignor_to_address",
  },
  { type: "input", label: "Consignee GST No.", name: "consignee_gst_no" },
];

const VEHICLE_PACKAGE_INPUTS: InputType[] = [
  { type: "input", label: "Package", name: "pkg" },
  { type: "input", label: "Vehicle No.", name: "vehicle_no" },
  { type: "textarea", label: "From", name: "from" },
  { type: "textarea", label: "To", name: "to" },
  { type: "input", label: "BE No.", name: "be_no" },
  { type: "date", label: "BE Date", name: "be_date" },
  { type: "number", label: "Weight (KG)", name: "weight" },
  { type: "input", label: "CBM", name: "cbm" },
  { type: "input", label: "Fixed", name: "fixed" },
  { type: "input", label: "Rate Per", name: "rate_per" },
  { type: "input", label: "Mode of Packing", name: "mode_of_packing" },
];

const INVOICE_INPUTS: InputType[] = [
  { type: "input", label: "Invoice No.", name: "invoice_no" },
  { type: "input", label: "Eway Bill No.", name: "eway_bill_no" },
  {
    type: "input",
    label: "Description of Goods",
    name: "description_of_goods",
  },
  { type: "input", label: "Container No.", name: "container_no" },
  { type: "input", label: "Value", name: "value" },
];

const CLERK_YARD_INPUTS: InputType[] = [
  { type: "input", label: "Name of Clerk", name: "name_of_clerk" },
  { type: "input", label: "Empty Yard Name", name: "empty_yard_name" },
  { type: "textarea", label: "Remark If Any", name: "remark_if_any" },
];

const BILLING_HIRE_INPUTS: InputType[] = [
  { type: "input", label: "To Be Billed At", name: "to_be_billed_at" },
  { type: "number", label: "Hire Amount", name: "hire_amount" },
  { type: "input", label: "Risk", name: "risk" },
  {
    type: "textarea",
    label: "Address of Billing Office",
    name: "address_of_billing_office",
  },
  { type: "number", label: "Rate", name: "rate" },
  { type: "number", label: "Advance", name: "advance" },
];

const TAX_TOTAL_INPUTS: InputType[] = [
  { type: "select", label: "State", name: "state" },
  { type: "number", label: "Sub Total", name: "sub_total" },
  { type: "number", label: "CGST", name: "cgst" },
  { type: "number", label: "SGST", name: "sgst" },
  { type: "number", label: "IGST", name: "igst" },
  { type: "number", label: "Grand Total", name: "grand_total" },
];

/** -------------------- Component -------------------- **/
const Entry: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.entry);

  const [entry, setEntry] = useState<EntryType>({
    _id: "",
    bill_no: "",
    bill_date: "",
    billing_party: { _id: "", name: "", address: "", gst_no: "" },
    lr_no: "",
    lr_date: "",
    consignor_name: "",
    consignor_from_address: "",
    consignor_gst_no: "",
    consignee: "",
    consignor_to_address: "",
    consignee_gst_no: "",
    pkg: "",
    vehicle_no: "",
    from: "",
    to: "",
    be_no: "",
    be_date: "",
    weight: "",
    cbm: "",
    fixed: "",
    rate_per: "",
    mode_of_packing: "",
    invoice_no: "",
    eway_bill_no: "",
    description_of_goods: "",
    container_no: "",
    value: "",
    name_of_clerk: "",
    empty_yard_name: "",
    remark_if_any: "",
    to_be_billed_at: "",
    hire_amount: "",
    risk: "",
    address_of_billing_office: "",
    rate: "",
    advance: "",
    extra_charges: [],
    sub_total: "",
    cgst: "",
    sgst: "",
    igst: "",
    grand_total: "",
    gst_up: "",
    if_gst_other_state: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const errorsRef = useRef(errors);

  const [parties, setParties] = useState<BillingPartyType[]>([]);
  const [selectedParty, setSelectedParty] = useState<BillingPartyType>({
    _id: "",
    name: "",
    address: "",
    gst_no: "",
  });
  const [partyError, setPartyError] = useState("");
  const partyRef = useRef<
    HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
  >(null);

  const [state, setState] = useState("UP");

  /** -------------------- Fetch Parties -------------------- **/
  useEffect(() => {
    const fetchAllParties = async () => {
      dispatch(partyStart());
      try {
        const response = await api.get("/billing-party/all-billing-parties");
        setParties(response.data.data);
        dispatch(partySuccess());
      } catch (error: any) {
        console.error("Error fetching parties:", error);
        dispatch(partyFailure());
      }
    };
    fetchAllParties();
  }, [dispatch]);

  /** -------------------- Sync Selected Party -------------------- **/
  useEffect(() => {
    setEntry((prev) => ({ ...prev, billing_party: selectedParty }));
  }, [selectedParty]);

  /** -------------------- Calculate Fields -------------------- **/
  useEffect(() => {
    const calculateFields = () => {
      const gstRate = state === "UP" ? 0.06 : 0.12;
      const rate = Number(entry.rate) || 0;
      const extraTotal = entry.extra_charges.reduce(
        (sum, ec) => sum + Number(ec.amount || 0),
        0
      );
      const gst = Math.round(rate * gstRate * 100) / 100;
      const subTotal = rate + extraTotal;
      const grandTotal = state === "UP" ? subTotal + 2 * gst : subTotal + gst;

      setEntry((prev) => ({
        ...prev,
        cgst: state === "UP" ? String(gst) : "",
        sgst: state === "UP" ? String(gst) : "",
        igst: state !== "UP" ? String(gst) : "",
        sub_total: String(subTotal),
        grand_total: String(grandTotal),
      }));
    };
    calculateFields();
  }, [entry.rate, entry.extra_charges, state]);

  /** -------------------- Handlers -------------------- **/
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (errorsRef.current[name]) {
      errorsRef.current[name] = "";
      setErrors({ ...errorsRef.current });
    }

    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (val: string, mode: "select" | "search") => {
    if (mode === "select") {
      setState(val);
    } else {
      if (val === "") {
        setSelectedParty({ _id: "", name: "", address: "", gst_no: "" });
      setPartyError("Please select a Billing Party");
      } else {
        setSelectedParty(parties.find((p) => p.name === val) || selectedParty);
        setPartyError("");
      }
    }
  };

  const fetchOptions = async (search: string): Promise<Option[]> => {
    try {
      const response = await api.get(`/billing-party/by-name/${search}`);
      const parties = response.data.data;
      if (parties.length > 0) {
        const options: Option[] = parties.map((party: BillingPartyType) => ({
          label: party.name,
          value: party.name,
        }));
        return options;
      } else {
        return [];
      }
    } catch (error: any) {
      dispatch(
        addMessage({ type: "error", text: error.response?.data?.message })
      );
      return [];
    }
  };

  const handleExtraChargeChange = (
    id: string,
    field: string,
    value: string
  ) => {
    setEntry((prev) => ({
      ...prev,
      extra_charges: prev.extra_charges.map((ec) =>
        ec._id === id ? { ...ec, [field]: value } : ec
      ),
    }));
  };

  const addExtraCharge = () => {
    setEntry((prev) => ({
      ...prev,
      extra_charges: [
        ...prev.extra_charges,
        { _id: uuidv4(), type: "", amount: "", rate: "", per_amount: "" },
      ],
    }));
  };

  const removeExtraCharge = (id: string) => {
    setEntry((prev) => ({
      ...prev,
      extra_charges: prev.extra_charges.filter((ec) => ec._id !== id),
    }));
  };

  const partyValidation = () => {
    if (selectedParty.name === "") {
      setPartyError("Please select a Billing Party");
      dispatch(
        addMessage({ type: "error", text: "Please select a Billing Party" })
      );
      partyRef.current?.focus();
      return true;
    }
    setPartyError("");
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(entryStart());

    if (partyValidation()) {
      dispatch(entryFailure());
      return;
    }

    try {
      const response = await api.post(
        "/billing-entry/new-billing-entry",
        entry
      );
      dispatch(addMessage({ type: "success", text: response.data.message }));
      dispatch(entrySuccess());
      navigate("/");
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
              : "New Entry Creation Failed",
        })
      );
      dispatch(entryFailure());
    }
  };

  /** -------------------- Render Inputs -------------------- **/
  const renderInputs = (inputs: InputType[]) => {
    return inputs.map((input) => {
      let options: Option[] = [];
      let selectMode: "select" | "search" = "select";
      let error: string = errorsRef.current[input.name] || "";
      let value: string = String(entry[input.name as keyof EntryType] || "");
      let placeholder: string = input.label;
      let inputRef:
        | React.RefObject<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | undefined = undefined;

      if (input.name === "billing_party") {
        error = partyError;
        placeholder = "Select a Billing Party";
        value = selectedParty.name;
        selectMode = "search";
        inputRef = partyRef as React.RefObject<HTMLInputElement>;
      }

      if (input.name === "state") {
        value = state;
        placeholder = "";
        options = [
          { label: "UP", value: "UP" },
          { label: "Not UP", value: "Not UP" },
        ];
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
          options={options}
          error={error}
          selectMode={selectMode}
          inputRef={inputRef || undefined}
          onChange={handleChange}
          onSelectChange={(val, mode) => handleSelectChange(val, mode)}
          fetchOptions={fetchOptions}
        />
      );
    });
  };

  /** -------------------- JSX -------------------- **/
  return (
    <div className={styles.entryFormContainer}>
      <h1 className={styles.heading}>New Bill Entry</h1>
      <form className={styles.entryForm} onSubmit={handleSubmit}>
        <div className={styles.inputArea}>
          <FormSection title="Bill Information">
            {renderInputs(BILL_INFO_INPUTS)}
            <div className={styles.formGroup}>
              <FormInput
                type="textarea"
                id="address"
                name="address"
                label="Billing Party Address"
                placeholder="Billing Party Address"
                value={selectedParty.address}
                onChange={() => {}}
              />
              <FormInput
                type="input"
                id="gst_no"
                name="gst_no"
                label="GST No."
                placeholder="GST No."
                value={selectedParty.gst_no}
                onChange={() => {}}
              />
            </div>
          </FormSection>

          <FormSection title="LR Information">
            {renderInputs(LR_INFO_INPUTS)}
          </FormSection>
          <FormSection title="Consignor Information">
            {renderInputs(CONSIGNOR_INPUTS)}
          </FormSection>
          <FormSection title="Consignee Information">
            {renderInputs(CONSIGNEE_INPUTS)}
          </FormSection>
          <FormSection title="Vehicle & Package Info">
            {renderInputs(VEHICLE_PACKAGE_INPUTS)}
          </FormSection>
          <FormSection title="Invoice & Eway">
            {renderInputs(INVOICE_INPUTS)}
          </FormSection>
          <FormSection title="Clerk & Yard">
            {renderInputs(CLERK_YARD_INPUTS)}
          </FormSection>
          <FormSection title="Billing & Hire">
            {renderInputs(BILLING_HIRE_INPUTS)}
          </FormSection>

          <FormSection title="Extra Charges">
            <div className={styles.extraChargesSection}>
              {entry.extra_charges.map((ec) => (
                <div key={ec._id} className={styles.extraChargeRow}>
                  {(
                    Object.entries(EXTRA_CHARGE_LABELS) as [
                      keyof ExtraCharge,
                      string
                    ][]
                  ).map(([field, label]) => (
                    <input
                      key={field}
                      value={ec[field as keyof typeof ec]}
                      onChange={(e) =>
                        handleExtraChargeChange(ec._id, field, e.target.value)
                      }
                      placeholder={label}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => removeExtraCharge(ec._id)}
                    className={styles.removeExtraChargeBtn}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                className={styles.addExtraChargeBtn}
                type="button"
                onClick={addExtraCharge}
              >
                Add Extra Charge
              </button>
            </div>
          </FormSection>

          <FormSection title="Tax & Total">
            {renderInputs(TAX_TOTAL_INPUTS)}
          </FormSection>
        </div>

        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            Add Entry
          </button>
        </div>
      </form>
    </div>
  );
};

export default Entry;
