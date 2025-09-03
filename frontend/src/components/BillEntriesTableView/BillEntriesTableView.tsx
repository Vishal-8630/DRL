import React from "react";
import { ENTRY_LABELS, type EntryType } from "../../types/entry";
import styles from "./BillEntriesTableView.module.scss";
import EntryRow from "../EntryRow";
import { PARTY_LABELS, type BillingPartyType } from "../../types/party";

interface TableViewProps {
  entries: EntryType[];
}

const BillEntriesTableView: React.FC<TableViewProps> = ({ entries }) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        {/* Header */}
        <thead>
          <tr>
            {Object.keys(ENTRY_LABELS).map((key) => {
              if (key === 'extra_charges') {
                return <th key={key}>Extra Charges</th>
              } else if (key === 'billing_party') {
                return (Object.entries(PARTY_LABELS) as [keyof BillingPartyType, string][]).map(([subKey, subValue]) => {
                  return <th key={subKey}>{subValue}</th>
                })
              } else {
                return <th key={key}>{ENTRY_LABELS[key]}</th>
              }
            })}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {entries.map((entry, index) => (
            <EntryRow key={index} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BillEntriesTableView;