import { useEffect, useState, } from "react";
import styles from "./BillEntries.module.scss";
import { FaTimes, FaSearch, FaChevronDown } from "react-icons/fa";
import Loading from "../../components/Loading";
import { useDispatch } from "react-redux";
import { addMessage } from "../../features/message";
import BillEntriesDropdownView from "../../components/BillEntriesDropdownView";
import { type Variants, AnimatePresence, motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../animations/animations";
import {
  buildRows,
  getHeaderLabels,
  getOrderedHeaders,
} from "../../utils/flattenEntries";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import PaginatedList from "../../components/PaginatedList";
import { useSelector } from "react-redux";
import { billEntrySelectors, fetchBillEntriesAsync, searchBillEntriesByParamAsync, selectBillEntryLoading } from "../../features/billEntry";
import type { AppDispatch } from "../../app/store";

const SEARCH_MAPPING: Record<string, string> = {
  "Bill Number": "bill_no",
  "Vehicle Number": "vehicle_no",
  "LR Number": "lr_no",
};

const SEARCH_OPTIONS = Object.keys(SEARCH_MAPPING);
const DEBOUNCE_DELAY = 500;

const dropDownVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -5, transition: { duration: 0.3 } },
};

/* 🔥 Reusable Dropdown Component */
const Dropdown = ({
  options,
  selected,
  onSelect,
  isOpen,
  setIsOpen,
}: {
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) => {
  return (
    <div className={styles.viewContent}>
      <div className={styles.viewList} onClick={() => setIsOpen(!isOpen)}>
        <span>{selected}</span>
        <div className={styles.viewIcon}>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.07 }}
          >
            <FaChevronDown />
          </motion.span>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.viewDropdown}
            variants={dropDownVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {options.map((opt, idx) => (
              <div
                key={opt}
                onClick={() => {
                  onSelect(opt);
                  setIsOpen(false);
                }}
              >
                {opt}
                {idx < options.length - 1 && <hr />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BillEntries = () => {
  const [search, setSearch] = useState("");
  const [searchParam, setSearchParam] = useState(SEARCH_OPTIONS[0]);
  let billEntries = useSelector(billEntrySelectors.selectAll);
  const loading = useSelector(selectBillEntryLoading)
  const [openDropdown, setOpenDropdown] = useState<"search" | "view" | null>(
    null
  );

  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBillEntriesAsync());
  }, [dispatch]);

  useEffect(() => {
    if (!search) {
      dispatch(fetchBillEntriesAsync());
      return;
    }
    const handler = setTimeout(() => handleSearch(), DEBOUNCE_DELAY);
    return () => clearTimeout(handler);
  }, [search, searchParam]);

  const handleSearchClear = () => {
    setSearch("");
    dispatch(fetchBillEntriesAsync());
  };

  const handleSearch = async () => {
    if (!search) {
      return dispatch(
        addMessage({ type: "error", text: "Please enter something to search" })
      );
    }

    const paramKey = SEARCH_MAPPING[searchParam];
    const query = encodeURIComponent(
      search
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .join(",")
    );

    try {
      const resultAction = await dispatch(searchBillEntriesByParamAsync({ [paramKey]: query }));
      if (searchBillEntriesByParamAsync.fulfilled.match(resultAction)) {
        const searchedEntries = resultAction.payload;
        if (searchedEntries?.length > 0) {
          billEntries = searchedEntries
        } else {
          dispatch(addMessage({ type: "info", text: "No entry found" }));
        }
      } else if(searchBillEntriesByParamAsync.rejected.match(resultAction)) {
        dispatch(addMessage({ type: "error", text: "Failed to search entry" }));
      }
    } catch {
      dispatch(
        addMessage({
          type: "error",
          text: "Something went wrong."
        })
      );
    }
  };

  const handleExport = () => {
    const headers = getOrderedHeaders(billEntries);
    const headerLabels = getHeaderLabels(headers);
    const rows = buildRows(billEntries, headers);

    // Replace keys with labels for Excel
    const labeledRows = rows.map((row) => {
      const labeled: Record<string, any> = {};
      headers.forEach((key, i) => {
        labeled[headerLabels[i]] = row[key];
      });
      return labeled;
    });

    const worksheet = XLSX.utils.json_to_sheet(labeledRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Entries");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    // 👇 generate filename with current date
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const dateStr = `${day}-${month}-${year}`;
    const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
    const fileName = `entries_${dateStr}_${timeStr}.xlsx`;

    saveAs(blob, fileName);
  };

  if (loading) return <Loading />;

  return (
    <div className={styles.billEntriesContainer}>
      <div className={styles.viewContainer}>
        {/* 🔍 Search Section */}
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

          {/* Search Param Dropdown */}
          <Dropdown
            options={SEARCH_OPTIONS}
            selected={searchParam}
            onSelect={(val) => setSearchParam(val)}
            isOpen={openDropdown === "search"}
            setIsOpen={(isOpen) => setOpenDropdown(isOpen ? "search" : null)}
          />
        </div>
      </div>

      {/* 📄 Content Area */}
      <div className={styles.homeContent}>
        <PaginatedList
          items={billEntries}
          itemsPerPage={10}
          renderItem={(entry) => {
            return (
              <motion.div
                key={entry._id}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div key={entry._id} variants={fadeInUp}>
                  <BillEntriesDropdownView
                    entry={entry}
                  />
                </motion.div>
              </motion.div>
            );
          }}
        />
      </div>

      <button className={styles.excelBtn} onClick={handleExport}>
        Download Excel
      </button>
    </div>
  );
};

export default BillEntries;
