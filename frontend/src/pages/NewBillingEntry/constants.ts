
export interface InputType {
  type: string;
  label: string;
  name: string;
  options?: string[];
}

export type Option = { label: string; value: string };

export const BILL_INFO_INPUTS: InputType[] = [
  { type: "number", label: "Bill No.", name: "bill_no" },
  { type: "date", label: "Bill Date", name: "bill_date" },
  { type: "select", label: "Billing Party", name: "billing_party" },
];

export const LR_INFO_INPUTS: InputType[] = [
  { type: "number", label: "LR No.", name: "lr_no" },
  { type: "date", label: "LR Date", name: "lr_date" },
];

export const CONSIGNOR_INPUTS: InputType[] = [
  { type: "input", label: "Consignor Name", name: "consignor_name" },
  {
    type: "textarea",
    label: "Consignor From Address",
    name: "consignor_from_address",
  },
  { type: "textarea", label: "Consignor GST No.", name: "consignor_gst_no" },
];

export const CONSIGNEE_INPUTS: InputType[] = [
  { type: "input", label: "Consignee Name", name: "consignee" },
  {
    type: "textarea",
    label: "Consignee Address",
    name: "consignor_to_address",
  },
  { type: "input", label: "Consignee GST No.", name: "consignee_gst_no" },
];

export const VEHICLE_PACKAGE_INPUTS: InputType[] = [
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

export const INVOICE_INPUTS: InputType[] = [
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

export const CLERK_YARD_INPUTS: InputType[] = [
  { type: "input", label: "Name of Clerk", name: "name_of_clerk" },
  { type: "input", label: "Empty Yard Name", name: "empty_yard_name" },
  { type: "textarea", label: "Remark If Any", name: "remark_if_any" },
];

export const BILLING_HIRE_INPUTS: InputType[] = [
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

export const TAX_TOTAL_INPUTS: InputType[] = [
  { type: "select", label: "State", name: "state" },
  { type: "number", label: "Sub Total", name: "sub_total" },
  { type: "number", label: "CGST", name: "cgst" },
  { type: "number", label: "SGST", name: "sgst" },
  { type: "number", label: "IGST", name: "igst" },
  { type: "number", label: "Grand Total", name: "grand_total" },
];