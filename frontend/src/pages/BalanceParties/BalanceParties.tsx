import React, { useEffect, useState } from "react";
import type { BalancePartyType } from "../../types/vehicle";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectBalancePartyLoading } from "../../features/balanceParty/balancePartySelectors";
import api from "../../api/axios";
import { addMessage } from "../../features/message";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../animations/animations";
import BalancePartyDropDown from "../../components/BalancePartyDropDown";
import styles from "./BalanceParties.module.scss";
import PaginatedList from "../../components/PaginatedList";
import FilterContainer from "../../components/FilterContainer";
import Loading from "../../components/Loading";
import { BalancePartyFilters } from "../../filters/BalancePartyFilters";

type balancePartyState = {
  localBalanceParty: BalancePartyType;
  drafts: Partial<BalancePartyType>;
  editing: Set<keyof BalancePartyType>;
  isOpen: boolean;
};

const BalanceParties = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectBalancePartyLoading);

  const [balanceParties, setBalanceParties] = useState<BalancePartyType[]>([]);
  const [balancePartyStates, setBalancePartyStates] = useState<
    Record<string, balancePartyState>
  >({});
  const [filteredBalanceParties, setFilteredBalanceParties] = useState<
    BalancePartyType[]
  >([]);

  useEffect(() => {
    const fetchAllBalanceParties = async () => {
      try {
        const resposne = await api.get("/balance-party/all-balance-parties");
        const data: BalancePartyType[] = resposne.data.data;
        setBalanceParties(data);

        // Initialize per-party state
        const initialStates: Record<string, balancePartyState> = {};
        data.forEach((p) => {
          initialStates[p._id] = {
            localBalanceParty: { ...p },
            drafts: {},
            editing: new Set(),
            isOpen: false,
          };
        });
        setBalancePartyStates(initialStates);
      } catch (error: any) {
        dispatch(
          addMessage({
            type: "error",
            text:
              error.response?.data?.mesage || "Failed to fetch balance parties",
          })
        );
        console.error("Failed to fetch balance parties", error.response);
      }
    };

    fetchAllBalanceParties();
  }, []);

  useEffect(() => {
    setFilteredBalanceParties(balanceParties);
  }, [balanceParties]);

  const updateBalancePartyState = (
    id: string,
    state: Partial<balancePartyState>
  ) => {
    setBalancePartyStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...state,
      },
    }));
  };

  const updateDraft = (
    id: string,
    key: keyof BalancePartyType,
    value: string
  ) => {
    setBalancePartyStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        drafts: { ...prev[id].drafts, [key]: value },
      },
    }));
  };

  const toggleEditing = (id: string, key: keyof BalancePartyType) => {
    setBalancePartyStates((prev) => {
      const editing = new Set(prev[id].editing);
      if (editing.has(key)) editing.delete(key);
      else editing.add(key);
      return { ...prev, [id]: { ...prev[id], editing } };
    });
  };

  const toggleOpen = (id: string) => {
    setBalancePartyStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: !prev[id].isOpen },
    }));
  };

  const updateOriginalBalanceParty = (
    updatedBalanceParty: BalancePartyType
  ) => {
    setBalanceParties((prev) =>
      prev.map((p) =>
        p._id === updatedBalanceParty._id ? updatedBalanceParty : p
      )
    );
  };

  if (loading) return <Loading />;

  return (
    <div>
      <motion.div
        key="list"
        className={styles.balancePartiesContainer}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.headerArea}>
          <FilterContainer
            data={balanceParties}
            filters={BalancePartyFilters}
            onFiltered={setFilteredBalanceParties}
          />
        </div>
        <section>
          <h1 className={styles.heading}>All Balance Parties</h1>
          <PaginatedList
            items={filteredBalanceParties}
            itemsPerPage={10}
            renderItem={(p) => (
              <motion.div key={p._id} variants={fadeInUp}>
                <BalancePartyDropDown
                  balanceParty={p}
                  balancePartyState={balancePartyStates[p._id]}
                  updateBalancePartyState={updateBalancePartyState}
                  updateDraft={updateDraft}
                  toggleEditing={toggleEditing}
                  toggleOpen={toggleOpen}
                  updateOriginalBalanceParty={updateOriginalBalanceParty}
                />
              </motion.div>
            )}
          />
        </section>
      </motion.div>
    </div>
  );
};

export default BalanceParties;
