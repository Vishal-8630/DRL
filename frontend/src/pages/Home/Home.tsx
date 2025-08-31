import { useEffect, useState } from "react";
import styles from "./Home.module.scss";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import type { EntryType } from "../../types/entry";
import api from "../../api/axios";
import Loading from "../../components/Loading";
import { useDispatch } from "react-redux";
import { addMessage } from "../../features/message";
import { FaSearch } from "react-icons/fa";
import TableView from "../../components/TableView";
import DropdownView from "../../components/DropdownView";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";

const SEARCH_MAPPING: Record<string, string> = {
  "Bill Number": "bill_no",
  "Vehicle Number": "vehicle_no",
  "LR Number": "lr_no",
};

const DEBOUNCE_DELAY = 500;

const Home = () => {
  const [view, setView] = useState("Table");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("Bill Number");
  const [entries, setEntries] = useState<EntryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchEntries = async () => {
    try {
      const response = await api.get("/entry/all-entries");
      const obj = response.data;
      setEntries(obj.data);
    } catch (error: any) {
      dispatch(
        addMessage({
          type: "error",
          text: error.response?.data?.message || "Error in loading entries",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (!search) {
      fetchEntries();
      return;
    }

    const handler = setTimeout(() => {
      handleSearch();
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [search]);

  const handleSearchClear = () => {
    setSearch("");
    fetchEntries();
  };

  const handleSearch = async () => {
    if (!search) {
      return dispatch(
        addMessage({ type: "error", text: "Please enter something to search" })
      );
    }
    const param = SEARCH_MAPPING[searchParam];
    const values = search
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v);

    const query = encodeURIComponent(values.join(","));
    const url = `/entry?${param}=${query}`;

    try {
      const response = await api.get(url);
      const obj = response.data;
      if (obj.data.length > 0) {
        setEntries(obj.data);
      } else {
        dispatch(
          addMessage({
            type: "info",
            text: "No entry found with the search value",
          })
        );
        fetchEntries();
      }
    } catch (error: any) {
      dispatch(
        addMessage({
          type: "error",
          text: error.response?.data?.message || "Failed to fetch. Please try again after sometime.",
        })
      );
    }
  };

  const updateOriginalEntry = (updatedEntry: EntryType) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry._id === updatedEntry._id ? updatedEntry : entry
      )
    );
  };

  if (loading) return <Loading />;

  return (
    <div className={styles.homeContainer}>
      <div className={styles.viewContainer}>
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <div className={styles.icon}>
              <FaSearch />
            </div>
            <input
              value={search}
              className={styles.input}
              type="text"
              placeholder={searchParam}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <div className={styles.cancelSearch}>
                <FaTimes size={20} onClick={handleSearchClear} />
              </div>
            )}
          </div>
          <div className={styles.viewContent}>
            <div className={styles.viewText}>Search By:</div>
            <div
              className={styles.viewList}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <span>{searchParam}</span>
              <div className={styles.viewIcon}>
                {isSearchOpen ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>
            <div
              className={`${styles.viewDropdown} ${
                isSearchOpen ? styles.open : ""
              }`}
            >
              <div
                onClick={() => {
                  setSearchParam("Bill Number");
                  setIsSearchOpen(!isSearchOpen);
                }}
              >
                Bill Number
              </div>
              <hr />
              <div
                onClick={() => {
                  setSearchParam("Vehicle Number");
                  setIsSearchOpen(!isSearchOpen);
                }}
              >
                Vehicle Number
              </div>
              <hr />
              <div
                onClick={() => {
                  setSearchParam("LR Number");
                  setIsSearchOpen(!isSearchOpen);
                }}
              >
                LR Number
              </div>
            </div>
          </div>
        </div>
        {user ? (
          <div className={styles.viewContent}>
            <div className={styles.viewText}>View:</div>
            <div className={styles.viewList} onClick={() => setOpen(!open)}>
              <span>{view}</span>
              <div className={styles.viewIcon}>
                {open ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>
            <div
              className={`${styles.viewDropdown} ${open ? styles.open : ""}`}
            >
              <div
                onClick={() => {
                  setView("Table");
                  setOpen(!open);
                }}
              >
                Table
              </div>
              <hr />
              <div
                onClick={() => {
                  setView("Dropdown");
                  setOpen(!open);
                }}
              >
                Dropdown
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className={styles.homeContent}>
        {view === "Table" ? (
          <div>
            <TableView entries={entries} />
          </div>
        ) : (
          <>
            {entries.map((entry, i) => (
              <DropdownView
                key={i}
                entry={entry}
                onUpdate={updateOriginalEntry}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
