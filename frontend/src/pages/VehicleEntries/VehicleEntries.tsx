import { useEffect, useState } from "react";
import { type VehicleEntryType } from "../../types/vehicle";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectVehicleLoading } from "../../features/vehicle/vehicleSelectors";
import api from "../../api/axios";
import Loading from "../../components/Loading";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../animations/animations";
import VehicleEntryDropdown from "../../components/VehicleEntryDropdown";
import { addMessage } from "../../features/message";
import styles from "./VehicleEntries.module.scss";
import { applyFilters } from "../../filters/applyFilers";
import GenericFilter from "../../components/GenericFilter";
import { vehicleEntryFilters } from "../../filters/vehicleEntryFilters";
import { applyGenericFilters } from "../../filters/filerHelper";

type VehicleState = {
  localVehicleEntry: VehicleEntryType;
  drafts: Partial<VehicleEntryType>;
  editing: Set<keyof VehicleEntryType>;
  isOpen: boolean;
};

const VehicleEntries = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectVehicleLoading);

  const [vehicleEntries, setVehicleEntries] = useState<VehicleEntryType[]>([]);
  const [vehicleStates, setVehicleStates] = useState<
    Record<string, VehicleState>
  >({});
  const [filteredEntries, setFilteredEntries] = useState<VehicleEntryType[]>(
    []
  );
  const [filters, setFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchVehicleEntries = async () => {
      try {
        const response = await api.get("/vehicle-entry/all-vehicle-entries");
        const data: VehicleEntryType[] = response.data.data;
        setVehicleEntries(data);

        // Initalize per-vehicle state
        const initialStates: Record<string, VehicleState> = {};
        data.forEach((v) => {
          initialStates[v._id] = {
            localVehicleEntry: { ...v },
            drafts: {},
            editing: new Set(),
            isOpen: false,
          };
        });
        setVehicleStates(initialStates);
      } catch (error: any) {
        dispatch(
          addMessage({
            type: "error",
            text:
              error.response?.data?.mesage || "Failed to fetch vehicle entries",
          })
        );
        console.error("Failed to fetch vehicle entries", error.response);
      }
    };
    fetchVehicleEntries();
  }, []);

  useEffect(() => {
    setFilteredEntries(vehicleEntries);
  }, [vehicleEntries]);

  const updateVehicleState = (id: string, newState: Partial<VehicleState>) => {
    setVehicleStates((prevStates) => ({
      ...prevStates,
      [id]: { ...prevStates[id], ...newState },
    }));
  };

  const updateDraft = (
    id: string,
    key: keyof VehicleEntryType,
    value: string
  ) => {
    setVehicleStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        drafts: { ...prev[id].drafts, [key]: value },
      },
    }));
  };

  const toggleEditing = (id: string, key: keyof VehicleEntryType) => {
    setVehicleStates((prev) => {
      const editing = new Set(prev[id].editing);
      if (editing.has(key)) editing.delete(key);
      else editing.add(key);
      return { ...prev, [id]: { ...prev[id], editing } };
    });
  };

  const toggleOpen = (id: string) => {
    setVehicleStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: !prev[id].isOpen },
    }));
  };

  const updateOriginalVehicleEntry = (
    updatedVehicleEntry: VehicleEntryType
  ) => {
    setVehicleEntries((prev) =>
      prev.map((v) =>
        v._id === updatedVehicleEntry._id ? updatedVehicleEntry : v
      )
    );
  };

  if (loading) return <Loading />;

  return (
    <div>
      <motion.div
        key="list"
        className={styles.vehicleEntriesContainer}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.filterBar}>
          <GenericFilter
            filters={vehicleEntryFilters}
            onApply={(values) => {
              setFilters(values);
              const hasFilters = Object.values(values).some(
                (val) =>
                  val != null &&
                  val !== "" &&
                  !(Array.isArray(val) && val.every((v) => !v))
              );
              const result = hasFilters
                ? applyGenericFilters(
                    vehicleEntries,
                    values,
                    vehicleEntryFilters
                  )
                : vehicleEntries;
              setFilteredEntries(result);
            }}
          />
        </div>
        {filteredEntries.map((v) => (
          <motion.div key={v._id} variants={fadeInUp}>
            <VehicleEntryDropdown
              vehicleEntry={v}
              vehicleState={vehicleStates[v._id]}
              updateVehicleState={updateVehicleState}
              updateDraft={updateDraft}
              toggleEditing={toggleEditing}
              toggleOpen={toggleOpen}
              updateOriginalVehicleEntry={updateOriginalVehicleEntry}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default VehicleEntries;
