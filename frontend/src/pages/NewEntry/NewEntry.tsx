import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import { entryStart, entrySuccess, entryFailure } from "../../features/entry";
import { partyFailure, partyStart, partySuccess } from "../../features/party";
import { addMessage } from "../../features/message";

import type { RootState } from "../../app/store";
import type { EntryType } from "../../types/entry";
import type { BillingPartyType } from "../../types/party";

import styles from "./NewEntry.module.scss";

const Entry: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.entry);

  /** -------------------- State Declarations -------------------- **/
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
    name: "none",
    address: "",
    gst_no: "",
  });
  const [partyError, setPartyError] = useState("");
  const partyRef = useRef<HTMLSelectElement>(null);

  const [state, setState] = useState("UP");

  /** -------------------- useEffect Hooks -------------------- **/

  // Fetch all billing parties on component mount
  useEffect(() => {
    const fetchAllParties = async () => {
      dispatch(partyStart());
      try {
        const response = await api.get("/party/all-parties");
        const obj = response.data;
        setParties(obj.data);
        dispatch(partySuccess());
      } catch (error: any) {
        console.log("Error fetching parties:", error.response);
        dispatch(partyFailure());
      }
    };
    fetchAllParties();
  }, [dispatch]);

  // Update the billing party in entry whenever selectedParty changes
  useEffect(() => {
    setEntry((prev) => ({
      ...prev,
      billing_party: selectedParty,
    }));
  }, [selectedParty]);

  // Calculate "Sub Total", "CGST", "SGST", "IGST", "Grand Total" on change of "Rate", "Extra Charges", "State"
  useEffect(() => {
    calculateFields();
  }, [entry.rate, entry.extra_charges, state]);

  /** -------------------- Event Handlers & Functions -------------------- **/

  // Handle input change for normal input fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "rate") {
      calculateFields();
    }

    // Clear error if exists
    if (errorsRef.current[name]) {
      errorsRef.current[name] = "";
      setErrors({ ...errorsRef.current });
    }

    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  // Handle extra charges input changes
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

  // Add new extra charge
  const addExtraCharge = () => {
    setEntry((prev) => ({
      ...prev,
      extra_charges: [
        ...prev.extra_charges,
        { _id: uuidv4(), type: "", amount: "", rate: "", per_amount: "" },
      ],
    }));
  };

  // Remove an extra charge
  const removeExtraCharge = (id: string) => {
    setEntry((prev) => ({
      ...prev,
      extra_charges: prev.extra_charges.filter((ec) => ec._id !== id),
    }));
  };

  // Validate if a billing party is selected
  const partyValidation = () => {
    if (selectedParty.name === "none") {
      setPartyError("Please select a Billing Party");
      dispatch(
        addMessage({ type: "error", text: "Please select a Billing Party" })
      );
      partyRef.current?.focus();
      return true;
    } else {
      setPartyError("");
      return false;
    }
  };

  // Handle billing party selection
  const handleSelectedParty = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "none") {
      return setSelectedParty({
        _id: "",
        name: "none",
        address: "",
        gst_no: "",
      });
    }
    const party = parties.find((p) => p.name === value)!;
    setSelectedParty(party);
    setPartyError("");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(entryStart());

    const isPartyError = partyValidation();
    if (!isPartyError) {
      try {
        const response = await api.post("/entry/new-entry", { ...entry });
        dispatch(addMessage({ type: "success", text: response.data.message }));
        dispatch(entrySuccess());
        navigate("/");
      } catch (error: any) {
        const errorsObj = error.response?.data?.errors;
        if (errorsObj) {
          Object.entries(errorsObj).forEach(([key, value]) => {
            errorsRef.current[key] = value as string;
          });
          setErrors({ ...errorsRef.current });
        }
        dispatch(
          addMessage({
            type: "error",
            text:
              Object.keys(errorsObj || {}).length > 0
                ? "Please fill all the required fields"
                : "New Entry Creation Failed",
          })
        );
        dispatch(entryFailure());
      }
    } else {
      dispatch(entryFailure());
    }
  };

  // Calculate "Sub Total", "CGST", "SGST", "IGST", "Grand Total"
  const calculateFields = () => {
    const calculateRate = (state === "UP") ? 0.06 :  0.12;
    const gst = Math.round(Number(entry.rate) * calculateRate * 100) / 100;
    if (state === "UP") {
      setEntry((prev) => ({
        ...prev,
        cgst: String(gst),
        sgst: String(gst),
        igst: "",
      }));
    } else {
      setEntry((prev) => ({
        ...prev,
        igst: String(gst),
        cgst: "",
        sgst: "",
      }));
    }
    let totalCharge = 0;
    let grandTotal = 0;
    const extraCharges = entry.extra_charges;
    if (extraCharges?.length > 0) {
      extraCharges.map((charge) => {
        totalCharge += parseInt(charge.amount || "0");
      });
    }
    totalCharge += parseInt(entry.rate || "0");
    grandTotal = totalCharge + 2*gst;
    setEntry((prev) => ({
      ...prev,
      sub_total: String(totalCharge),
      grand_total: String(grandTotal),
    }));
  };

  /** -------------------- JSX -------------------- **/
  return (
    <div className={styles.entryFormContainer}>
      <form className={styles.entryForm} onSubmit={handleSubmit}>
        <div className={styles.inputArea}>
          {/* -------------------- Bill Information -------------------- */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Bill Information</div>
            <div className={styles.formGroup}>
              <label>Bill No</label>
              <input
                name="bill_no"
                value={entry.bill_no}
                onChange={handleChange}
                placeholder="Bill No"
              />
              {errorsRef.current.bill_no && (
                <p className={styles.errorText}>{errorsRef.current.bill_no}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Bill Date</label>
              <input
                type="date"
                name="bill_date"
                value={entry.bill_date}
                onChange={handleChange}
              />
              {errorsRef.current.bill_date && (
                <p className={styles.errorText}>
                  {errorsRef.current.bill_date}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Billing Party Name</label>
              <select
                name="billing_party_name"
                value={selectedParty.name}
                onChange={handleSelectedParty}
                ref={partyRef}
              >
                <option value="none">Select Billing Party</option>
                {parties.map((party) => (
                  <option key={party._id} value={party.name}>
                    {party.name}
                  </option>
                ))}
              </select>
              {partyError && <p className={styles.errorText}>{partyError}</p>}
            </div>

            <div className={styles.formGroup}>
              <label>Billing Party Address</label>
              <textarea
                name="billing_party_address"
                value={selectedParty.address}
                onChange={handleChange}
                placeholder="Billing Party Address"
              />
            </div>
            <div className={styles.formGroup}>
              <label>GST No</label>
              <input
                name="gst_no"
                value={selectedParty.gst_no}
                onChange={handleChange}
                placeholder="GST No"
              />
            </div>
          </div>

          {/* -------------------- LR Information -------------------- */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>LR Information</div>
            <div className={styles.formGroup}>
              <label>LR No</label>
              <input
                name="lr_no"
                value={entry.lr_no}
                onChange={handleChange}
                placeholder="LR No"
              />
              {errorsRef.current.lr_no && (
                <p className={styles.errorText}>{errorsRef.current.lr_no}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>LR Date</label>
              <input
                type="date"
                name="lr_date"
                value={entry.lr_date}
                onChange={handleChange}
              />
              {errorsRef.current.lr_date && (
                <p className={styles.errorText}>{errorsRef.current.lr_date}</p>
              )}
            </div>
          </div>

          {/* -------------------- Consignor Information -------------------- */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Consignor Information</div>
            <div className={styles.formGroup}>
              <label>Consignor Name</label>
              <input
                name="consignor_name"
                value={entry.consignor_name}
                onChange={handleChange}
                placeholder="Consignor Name"
              />
              {errorsRef.current.consignor_name && (
                <p className={styles.errorText}>
                  {errorsRef.current.consignor_name}
                </p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Consignor From Address</label>
              <textarea
                name="consignor_from_address"
                value={entry.consignor_from_address}
                onChange={handleChange}
                placeholder="Consignor Address"
              />
              {errorsRef.current.consignor_from_address && (
                <p className={styles.errorText}>
                  {errorsRef.current.consignor_from_address}
                </p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Consignor GST No</label>
              <input
                name="consignor_gst_no"
                value={entry.consignor_gst_no}
                onChange={handleChange}
                placeholder="Consignor GST No"
              />
              {errorsRef.current.consignor_gst_no && (
                <p className={styles.errorText}>
                  {errorsRef.current.consignor_gst_no}
                </p>
              )}
            </div>
          </div>

          {/* -------------------- Consignee Information -------------------- */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Consignee Information</div>
            <div className={styles.formGroup}>
              <label>Consignee Name</label>
              <input
                name="consignee"
                value={entry.consignee}
                onChange={handleChange}
                placeholder="Consignee Name"
              />
              {errorsRef.current.consignee && (
                <p className={styles.errorText}>
                  {errorsRef.current.consignee}
                </p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Consignor To Address</label>
              <textarea
                name="consignor_to_address"
                value={entry.consignor_to_address}
                onChange={handleChange}
                placeholder="Consignee Address"
              />
              {errorsRef.current.consignor_to_address && (
                <p className={styles.errorText}>
                  {errorsRef.current.consignor_to_address}
                </p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Consignee GST No</label>
              <input
                name="consignee_gst_no"
                value={entry.consignee_gst_no}
                onChange={handleChange}
                placeholder="Consignee GST No"
              />
              {errorsRef.current.consignee_gst_no && (
                <p className={styles.errorText}>
                  {errorsRef.current.consignee_gst_no}
                </p>
              )}
            </div>
          </div>

          {/* -------------------- Vehicle & Package Info -------------------- */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Vehicle & Package Info</div>
            <div className={styles.formGroup}>
              <label>Package</label>
              <input
                name="pkg"
                value={entry.pkg}
                onChange={handleChange}
                placeholder="Package"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Vehicle No</label>
              <input
                name="vehicle_no"
                value={entry.vehicle_no}
                onChange={handleChange}
                placeholder="Vehicle No"
              />
              {errorsRef.current.vehicle_no && (
                <p className={styles.errorText}>
                  {errorsRef.current.vehicle_no}
                </p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>From</label>
              <input
                name="from"
                value={entry.from}
                onChange={handleChange}
                placeholder="From"
              />
              {errorsRef.current.from && (
                <p className={styles.errorText}>{errorsRef.current.from}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>To</label>
              <input
                name="to"
                value={entry.to}
                onChange={handleChange}
                placeholder="To"
              />
              {errorsRef.current.to && (
                <p className={styles.errorText}>{errorsRef.current.to}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>BE No</label>
              <input
                name="be_no"
                value={entry.be_no}
                onChange={handleChange}
                placeholder="BE No"
              />
            </div>
            <div className={styles.formGroup}>
              <label>BE Date</label>
              <input
                type="date"
                name="be_date"
                value={entry.be_date}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Weight</label>
              <input
                name="weight"
                value={entry.weight}
                onChange={handleChange}
                placeholder="Weight"
              />
              {errorsRef.current.weight && (
                <p className={styles.errorText}>{errorsRef.current.weight}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>CBM</label>
              <input
                name="cbm"
                value={entry.cbm}
                onChange={handleChange}
                placeholder="CBM"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Fixed</label>
              <input
                name="fixed"
                value={entry.fixed}
                onChange={handleChange}
                placeholder="Fixed"
              />
              {errorsRef.current.fixed && (
                <p className={styles.errorText}>{errorsRef.current.fixed}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Rate Per</label>
              <input
                name="rate_per"
                value={entry.rate_per}
                onChange={handleChange}
                placeholder="Rate Per"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Mode of Packing</label>
              <input
                name="mode_of_packing"
                value={entry.mode_of_packing}
                onChange={handleChange}
                placeholder="Mode of Packing"
              />
              {errorsRef.current.mode_of_packing && (
                <p className={styles.errorText}>
                  {errorsRef.current.mode_of_packing}
                </p>
              )}
            </div>
          </div>

          {/* -------------------- Invoice & Eway Bill -------------------- */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Invoice & Eway</div>
            <div className={styles.formGroup}>
              <label>Invoice No</label>
              <input
                name="invoice_no"
                value={entry.invoice_no}
                onChange={handleChange}
                placeholder="Invoice No"
              />
              {errorsRef.current.invoice_no && (
                <p className={styles.errorText}>
                  {errorsRef.current.invoice_no}
                </p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Eway Bill No</label>
              <input
                name="eway_bill_no"
                value={entry.eway_bill_no}
                onChange={handleChange}
                placeholder="Eway Bill No"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description of Goods</label>
              <textarea
                name="description_of_goods"
                value={entry.description_of_goods}
                onChange={handleChange}
                placeholder="Description of Goods"
              />
              {errorsRef.current.description_of_goods && (
                <p className={styles.errorText}>
                  {errorsRef.current.description_of_goods}
                </p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Container No</label>
              <input
                name="container_no"
                value={entry.container_no}
                onChange={handleChange}
                placeholder="Container No"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Value</label>
              <input
                name="value"
                value={entry.value}
                onChange={handleChange}
                placeholder="Value"
              />
              {errorsRef.current.value && (
                <p className={styles.errorText}>{errorsRef.current.value}</p>
              )}
            </div>
          </div>

          {/* -------------------- Clerk & Yard -------------------- */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Clerk & Yard</div>
            <div className={styles.formGroup}>
              <label>Name of Clerk</label>
              <input
                name="name_of_clerk"
                value={entry.name_of_clerk}
                onChange={handleChange}
                placeholder="Name of Clerk"
              />
              {errorsRef.current.name_of_clerk && (
                <p className={styles.errorText}>
                  {errorsRef.current.name_of_clerk}
                </p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Empty Yard Name</label>
              <input
                name="empty_yard_name"
                value={entry.empty_yard_name}
                onChange={handleChange}
                placeholder="Empty Yard Name"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Remark If Any</label>
              <textarea
                name="remark_if_any"
                value={entry.remark_if_any}
                onChange={handleChange}
                placeholder="Remark"
              />
            </div>
          </div>

          {/* -------------------- Billing & Hire -------------------- */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Billing & Hire</div>
            <div className={styles.formGroup}>
              <label>To Be Billed At</label>
              <input
                name="to_be_billed_at"
                value={entry.to_be_billed_at}
                onChange={handleChange}
                placeholder="To Be Billed At"
              />
              {errorsRef.current.to_be_billed_at && (
                <p className={styles.errorText}>
                  {errorsRef.current.to_be_billed_at}
                </p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Hire Amount</label>
              <input
                name="hire_amount"
                value={entry.hire_amount}
                onChange={handleChange}
                placeholder="Hire Amount"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Risk</label>
              <input
                name="risk"
                value={entry.risk}
                onChange={handleChange}
                placeholder="Risk"
              />
              {errorsRef.current.risk && (
                <p className={styles.errorText}>{errorsRef.current.risk}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Address of Billing Office</label>
              <textarea
                name="address_of_billing_office"
                value={entry.address_of_billing_office}
                onChange={handleChange}
                placeholder="Billing Office Address"
              />
              {errorsRef.current.address_of_billing_office && (
                <p className={styles.errorText}>
                  {errorsRef.current.address_of_billing_office}
                </p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Rate</label>
              <input
                name="rate"
                value={entry.rate}
                onChange={handleChange}
                placeholder="Rate"
              />
              {errorsRef.current.rate && (
                <p className={styles.errorText}>{errorsRef.current.rate}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Advance</label>
              <input
                name="advance"
                value={entry.advance}
                onChange={handleChange}
                placeholder="Advance"
              />
            </div>
          </div>

          {/* -------------------- Extra Charges -------------------- */}
          <div className={styles.formSection}>
            <div className={styles.extraChargesSection}>
              <div className={styles.sectionTitle}>Extra Charges</div>
              {entry.extra_charges.map((ec) => (
                <div key={ec._id} className={styles.extraChargeRow}>
                  <input
                    value={ec.type}
                    onChange={(e) =>
                      handleExtraChargeChange(ec._id, "type", e.target.value)
                    }
                    placeholder="Type"
                  />
                  <input
                    value={ec.amount}
                    onChange={(e) =>
                      handleExtraChargeChange(ec._id, "amount", e.target.value)
                    }
                    placeholder="Amount"
                  />
                  <input
                    value={ec.rate}
                    onChange={(e) =>
                      handleExtraChargeChange(ec._id, "rate", e.target.value)
                    }
                    placeholder="Rate"
                  />
                  <input
                    value={ec.per_amount}
                    onChange={(e) =>
                      handleExtraChargeChange(
                        ec._id,
                        "per_amount",
                        e.target.value
                      )
                    }
                    placeholder="Per Amount"
                  />
                  <button
                    type="button"
                    onClick={() => removeExtraCharge(ec._id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                className={styles.addExtraBtn}
                type="button"
                onClick={addExtraCharge}
              >
                Add Extra Charge
              </button>
            </div>
          </div>

          {/* -------------------- Tax & Total -------------------- */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Tax & Total</div>
            <div className={styles.formGroup}>
              <label>Sub Total</label>
              <input
                name="sub_total"
                value={entry.sub_total}
                onChange={handleChange}
                placeholder="Sub Total"
              />
            </div>
            <div className={styles.formGroup}>
              <label>State</label>
              <select
                name="state"
                id="state"
                onChange={(e) => setState(e.target.value)}
              >
                <option value="UP">UP</option>
                <option value="Not-UP">Not-UP</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>CGST</label>
              <input
                name="cgst"
                value={entry.cgst}
                onChange={handleChange}
                placeholder="CGST"
              />
            </div>
            <div className={styles.formGroup}>
              <label>SGST</label>
              <input
                name="sgst"
                value={entry.sgst}
                onChange={handleChange}
                placeholder="SGST"
              />
            </div>
            <div className={styles.formGroup}>
              <label>IGST</label>
              <input
                name="igst"
                value={entry.igst}
                onChange={handleChange}
                placeholder="IGST"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Grand Total</label>
              <input
                name="grand_total"
                value={entry.grand_total}
                onChange={handleChange}
                placeholder="Grand Total"
              />
            </div>
          </div>
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
