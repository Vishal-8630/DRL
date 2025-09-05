import { ENTRY_LABELS, EXTRA_CHARGE_LABELS, type EntryType, type ExtraCharge } from "../types/entry";


export function buildRows(entries: EntryType[], headers: string[]) {
  return entries.map((entry) => {
    const row: Record<string, any> = {};

    headers.forEach((headerKey) => {
      if (headerKey === "billing_party_name") {
        row[headerKey] =
          typeof entry.billing_party === "object" ? entry.billing_party.name : "";
      } else if (headerKey === "billing_party_gst") {
        row[headerKey] =
          typeof entry.billing_party === "object" ? entry.billing_party.gst_no : "";
      } else if (headerKey.startsWith("extra_charges")) {
        const match = headerKey.match(/^extra_charges_(\d+)_(.+)$/);
        if (match) {
          const [ , indexStr, field ] = match;
          const index = parseInt(indexStr, 10) - 1;
          const charge: ExtraCharge | undefined = entry.extra_charges[index];
          row[headerKey] = charge ? charge[field as keyof ExtraCharge] : "";
        }
      } else {
        row[headerKey] = (entry as any)[headerKey];
      }
    });

    return row;
  });
}

export function getOrderedHeaders(entries: EntryType[]) {
  const headers: string[] = [];

  const maxCharges = Math.max(...entries.map((e) => e.extra_charges.length));

  Object.keys(ENTRY_LABELS).forEach((key) => {
    if (key === "billing_party") {
      headers.push("billing_party_name", "billing_party_gst");
    } else if (key === "extra_charges") {
      for (let i = 1; i <= maxCharges; i++) {
        Object.keys(EXTRA_CHARGE_LABELS).forEach((field) => {
          headers.push(`extra_charges_${i}_${field}`);
        });
      }
    } else {
      headers.push(key);
    }
  });

  return headers;
}

export function getHeaderLabels(headers: string[]) {
  return headers.map((key) => {
    if (ENTRY_LABELS[key]) return ENTRY_LABELS[key];
    if (key === "billing_party_name") return "Billing Party Name";
    if (key === "billing_party_gst") return "Billing Party GST";

    const match = key.match(/^extra_charges_(\d+)_(.+)$/);
    if (match) {
      const [, index, field] = match;
      return `${EXTRA_CHARGE_LABELS[field]} ${index}`;
    }

    return key;
  });
}