import { FaSearch, FaTimes } from "react-icons/fa";
import styles from "./LRCopy.module.scss";
import { useState } from "react";
import Invoice from "../../components/Invoice";
import { useDispatch } from "react-redux";
import { entryFailure, entryStart, entrySuccess } from "../../features/entry";
import api from "../../api/axios";
import type { EntryType } from "../../types/entry";
import { addMessage } from "../../features/message";

const LRCopy = () => {
  const [search, setSearch] = useState("");
  const [entry, setEntry] = useState<EntryType | null>(null);
  const dispatch = useDispatch();

  const handleSearchClear = () => {
    setSearch("");
    setEntry(null);
  };

  const handleSearch = async () => {
    dispatch(entryStart());
    try {
      const response = await api.get(`/entry/${search}`);
      const obj = response.data;
      setEntry(obj.data[0]);
      dispatch(entrySuccess());
    } catch (error: any) {
      dispatch(addMessage({ type: "error", text: error.response?.data?.message || "Something went wrong" }));
      dispatch(entryFailure());
    }
  }

  return (
    <div className={styles.lrCopyContainer}>
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <div className={styles.icon}>
            <FaSearch />
          </div>
          <input
            value={search}
            className={styles.input}
            type="text"
            placeholder="LR Number"
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <div className={styles.cancelSearch}>
              <FaTimes size={20} onClick={handleSearchClear} />
            </div>
          )}
          <button className={styles.searchBtn} onClick={handleSearch}>Search</button>
        </div>
      </div>
      <div>
        <Invoice entry={entry!!} />
      </div>
    </div>
  );
};

export default LRCopy;
