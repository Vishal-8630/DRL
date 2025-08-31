import type { BillingPartyType } from "./party";

export interface ExtraCharge {
  _id: string;
  type: string;
  amount: string;
  rate: string;
  per_amount: string;
}

export const EXTRA_CHARGE_LABELS: Record<string, string> = {
  type: "Extra Charge",
  amount: "Amount",
  rate: "Rate",
  per_amount: "Per Amount",
};

export interface EntryType {
  _id: string;
  bill_no: string;
  bill_date: string;
  billing_party: BillingPartyType;
  lr_no: string;
  lr_date: string;
  consignor_name: string;
  consignor_from_address: string;
  consignor_gst_no: string;
  consignee: string;
  consignor_to_address: string;
  consignee_gst_no: string;
  pkg: string;
  vehicle_no: string;
  from: string;
  to: string;
  be_no: string;
  be_date: string;
  weight: string;
  cbm: string;
  fixed: string;
  rate_per: string;
  mode_of_packing: string;
  invoice_no: string;
  eway_bill_no: string;
  description_of_goods: string;
  container_no: string;
  value: string;
  name_of_clerk: string;
  empty_yard_name: string;
  remark_if_any: string;
  to_be_billed_at: string;
  hire_amount: string;
  risk: string;
  address_of_billing_office: string;
  rate: string;
  advance: string;
  extra_charges: ExtraCharge[];
  sub_total: string;
  cgst: string;
  sgst: string;
  igst: string;
  grand_total: string;
  gst_up: string;
  if_gst_other_state: string;
}

export const ENTRY_LABELS: Record<string, string> = {
  bill_no: "Bill No",
  bill_date: "Bill Date",
  billing_party: "Billing Party",
  lr_no: "LR No",
  lr_date: "LR Date",
  consignor_name: "Consignor Name",
  consignor_from_address: "Consignor From Address",
  consignor_gst_no: "Consignor GST No",
  consignee: "Consignee",
  consignor_to_address: "Consignor To Address",
  consignee_gst_no: "Consignor GST No",
  pkg: "Packages",
  vehicle_no: "Vehicle No",
  from: "From",
  to: "To",
  be_no: "BE No",
  be_date: "BE Date",
  weight: "Weight",
  cbm: "CBM",
  fixed: "Fixed",
  rate_per: "Rate Per",
  mode_of_packing: "Mode of Packing",
  invoice_no: "Invoice No",
  eway_bill_no: "E-way Bill No",
  description_of_goods: "Description of Goods",
  container_no: "Container No",
  value: "Value",
  name_of_clerk: "Clerk Name",
  empty_yard_name: "Empty Yard Name",
  remark_if_any: "Remark (if any)",
  to_be_billed_at: "To be billed at",
  hire_amount: "Hire Amount",
  risk: "Risk",
  address_of_billing_office: "Billing Office Address",
  rate: "Rate",
  advance: "Advance",
  extra_charges: "Extra Charges",
  sub_total: "Sub Total",
  cgst: "CGST",
  sgst: "SGST",
  igst: "IGST",
  grand_total: "Grand Total",
  gst_up: "GST UP",
  if_gst_other_state: "If GST Other State",
};
