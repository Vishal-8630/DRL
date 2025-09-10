import { useEffect, useState } from "react";
import styles from "./BillEntries.module.scss";
import { FaTimes, FaSearch, FaChevronDown } from "react-icons/fa";
import Loading from "../../components/Loading";
import { useDispatch } from "react-redux";
import { addMessage } from "../../features/message";
import BillEntriesDropdownView from "../../components/BillEntriesDropdownView";
import { type Variants, AnimatePresence, motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../animations/animations";
import PaginatedList from "../../components/PaginatedList";
import { useSelector } from "react-redux";
import {
  billEntrySelectors,
  fetchBillEntriesAsync,
  selectBillEntryLoading,
} from "../../features/billEntry";
import type { AppDispatch } from "../../app/store";
import type { BillEntryType } from "../../types/billEntry";
import ExcelButton from "../../components/ExcelButton";
import { BillEntryFilters } from "../../filters/billEntryFilters";
import FilterContainer from "../../components/FilterContainer";

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
  const loading = useSelector(selectBillEntryLoading);
  const [openDropdown, setOpenDropdown] = useState<"search" | "view" | null>(
    null
  );
  const [filteredEntries, setFilteredEntries] = useState<BillEntryType[]>([]);

  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    setFilteredEntries(billEntries);
  }, [billEntries]);

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

    const paramKey = SEARCH_MAPPING[searchParam] as keyof BillEntryType;
    const query = search
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const searchedEntries = billEntries.filter((entry) =>
      query.some((q) =>
        String(entry[paramKey]).toLowerCase().includes(q.toLowerCase())
      )
    );
    setFilteredEntries(searchedEntries);
  };

  if (loading) return <Loading />;

  return (
    <div className={styles.billEntriesContainer}>
      <div className={styles.viewContainer}>
        <FilterContainer
          data={billEntries}
          filters={BillEntryFilters}
          onFiltered={setFilteredEntries}
        />
      </div>
      <div className={styles.entriesContainer}>
        <h1 className={styles.heading}>All Bill Entries</h1>
        <PaginatedList
          items={filteredEntries}
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
                  <BillEntriesDropdownView entry={entry} />
                </motion.div>
              </motion.div>
            );
          }}
        />
      </div>

      <ExcelButton data={filteredEntries} fileNamePrefix="Bill_Entries" />
    </div>
  );
};

export default BillEntries;
