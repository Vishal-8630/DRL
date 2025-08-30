import React from "react";
import { ENTRY_LABELS, type EntryType } from "../../types/entry";
import styles from "./TableView.module.scss";
import EntryRow from "../EntryRow";

interface TableViewProps {
  entries: EntryType[];
}

const TableView: React.FC<TableViewProps> = ({ entries }) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        {/* Header */}
        <thead>
          <tr>
            {Object.keys(ENTRY_LABELS).map((key) => (
              <th key={key}>{ENTRY_LABELS[key]}</th>
            ))}
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

export default TableView;