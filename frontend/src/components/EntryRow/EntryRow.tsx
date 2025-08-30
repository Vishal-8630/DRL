import React from "react";
import { ENTRY_LABELS, type EntryType } from "../../types/entry";
import styles from "./EntryRow.module.scss";

interface EntryRowProps {
  entry: EntryType;
}

const EntryRow: React.FC<EntryRowProps> = ({ entry }) => {
  return (
    <tr className={styles.entryRow}>
      {(Object.entries(ENTRY_LABELS) as [keyof EntryType, string][]).map(
        ([k, _]) => {
          const key = k as keyof EntryType;

          if (key === "extra_charges") {
            return (
              <td key={key}>
                {entry.extra_charges.length > 0
                  ? entry.extra_charges.map((c) => (
                      <div key={c._id}>
                        {c.type}: {c.amount}
                      </div>
                    ))
                  : "—"}
              </td>
            );
          }

          return <td key={key}>{(entry[key] as string) ?? "—"}</td>;
        }
      )}
    </tr>
  );
};

export default EntryRow;
