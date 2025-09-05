import { useState, useEffect, useRef } from "react";
import styles from "./SmartDropdown.module.scss";

type Option = { label: string; value: string };

interface Props {
  label: string;
  options?: Option[];
  mode?: "select" | "search";
  value?: string;
  placeholder?: string;
  fetchOptions?: (query: string) => Promise<Option[]>;
  onChange: (val: string) => void;
}

const SmartDropdown = ({
  label,
  options = [],
  mode = "select",
  value = "",
  placeholder = "Select...",
  fetchOptions,
  onChange,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Option[]>(options);
  const [selected, setSelected] = useState<Option | null>(null);

  const ref = useRef<HTMLDivElement | null>(null);

  // Close on pointer/touch outside — more reliable than click in overlays
  useEffect(() => {
    const handlePointer = (e: Event) => {
      if (!ref.current) return;
      const target = e.target as Node | null;
      if (!target) return;
      if (!ref.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointer, true);
    document.addEventListener("touchstart", handlePointer, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointer, true);
      document.removeEventListener("touchstart", handlePointer, true);
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // keep "selected" in sync with external value
  useEffect(() => {
    if (value) {
      const match = data.find((opt) => opt.value === value);
      if (match) {
        setSelected(match);
      } else {
        setSelected({ label: value, value }); // fallback
      }
    } else {
      setSelected(null);
    }
  }, [value, data]);

  // fetch options dynamically in search mode OR sync data in select mode
  useEffect(() => {
    if (mode === "search" && fetchOptions && search.length > 0) {
      const timeout = setTimeout(() => {
        fetchOptions(search)
          .then(setData)
          .catch(() => setData([]));
      }, 300); // debounce
      return () => clearTimeout(timeout);
    } else if (mode === "search" && search.length === 0) {
      setData([]);
    } else if (mode === "select") {
      setData(options);
    }
  }, [search, mode, fetchOptions, options]);

  const handleSelect = (opt: Option) => {
    setSelected(opt);
    onChange(opt.value);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className={styles.dropdown} ref={ref}>
      <label>{label}</label>

      {mode === "select" ? (
        <div
          className={styles.control}
          onClick={(e) => {
            // stop propagation not necessary, but safe: ensure we toggle only after pointer handlers
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setOpen((p) => !p);
          }}
        >
          {selected ? selected.label : placeholder}
          <span className={styles.arrow}>▾</span>
        </div>
      ) : (
        <input
          type="text"
          className={styles.input}
          value={search || (selected ? selected.label : "")}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
        />
      )}

      {open && (
        <ul className={styles.menu}>
          {data.length === 0 ? (
            <li className={styles.menuEmpty}>No results</li>
          ) : (
            data.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt)}
                role="option"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSelect(opt);
                }}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default SmartDropdown;
