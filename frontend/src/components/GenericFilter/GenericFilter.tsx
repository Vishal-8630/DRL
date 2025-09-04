// src/components/GenericFilters.tsx
import { useEffect, useState } from "react";
import type { FilterConfig, AppliedFilters } from "../../filters/filter";

type Props<T> = {
  filters: FilterConfig<T>[];
  onApply: (values: AppliedFilters<T>) => void;
};

const GenericFilter = <T,>({ filters, onApply }: Props<T>) => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const handleChange = (field: string, value: any, type?: string) => {
    const key = type ? `${field}$${type}` : field;
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleRangeChange = (
    field: string,
    bound: "min" | "max",
    value: any
  ) => {
    setFilterValues((prev) => {
      const current: [any, any] = prev[field] ?? [undefined, undefined];
      const updated: [any, any] =
        bound === "min" ? [value, current[1]] : [current[0], value];

      return {
        ...prev,
        [field]: updated,
      };
    });
  };

  const applyFilters = () => {
    onApply(filterValues);
  };

  useEffect(() => {
    console.log(filterValues);
  }, [filterValues]);

  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {filters.map((f, idx) => {
        if (f.type === "sort") {
          return (
            <div key={idx}>
              <label>{f.label}</label>
              <select
                value={filterValues[`${f.field as string}$sort`] || ""}
                onChange={(e) =>
                  handleChange(f.field.toString(), e.target.value, "sort")
                }
              >
                <option value="">{f.label}</option>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          );
        }

        if (f.type === "less") {
          return (
            <div key={idx}>
              <label>{f.label}</label>
              <input
                type="date"
                value={filterValues[`${f.field as string}$less`] || ""}
                onChange={(e) =>
                  handleChange(f.field.toString(), e.target.value, "less")
                }
              />
            </div>
          );
        }

        if (f.type === "greater") {
          return (
            <div key={idx}>
              <label>{f.label}</label>
              <input
                type="date"
                value={filterValues[`${f.field as string}$greater`] || ""}
                onChange={(e) =>
                  handleChange(f.field.toString(), e.target.value, "greater")
                }
              />
            </div>
          );
        }

        if (f.type === "range") {
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: "0.5rem",
                flexDirection: "column",
              }}
            >
              <label>{f.label}</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="date"
                  placeholder="From"
                  value={filterValues[`${f.field as string}$range`]?.[0] || ""}
                  onChange={(e) =>
                    handleRangeChange(`${f.field.toString()}$range`, "min", e.target.value)
                  }
                />
                <input
                  type="date"
                  placeholder="To"
                  value={filterValues[`${f.field as string}$range`]?.[1] || ""}
                  onChange={(e) =>
                    handleRangeChange(`${f.field.toString()}$range`, "max", e.target.value)
                  }
                />
              </div>
            </div>
          );
        }

        if (f.type === "text") {
          return (
            <div key={idx}>
              <label>{f.label}</label>
              <input
                type="text"
                value={filterValues[`${f.field as string}$text`] || ""}
                onChange={(e) =>
                  handleChange(f.field.toString(), e.target.value, "text")
                }
              />
            </div>
          );
        }

        return null;
      })}
      <button onClick={applyFilters}>Apply</button>
      <button
        onClick={() => {
          setFilterValues({});
          onApply({});
        }}
      >
        Clear
      </button>
    </div>
  );
};

export default GenericFilter;
