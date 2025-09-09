import { useCallback, useEffect, useState } from "react";
import styles from "./PartyBalance.module.scss";
import {
  VEHICLE_ENTRY_LABELS,
  type BalancePartyType,
  type VehicleEntryType,
} from "../../types/vehicleEntry";
import api from "../../api/axios";
import { useDispatch } from "react-redux";
import { addMessage } from "../../features/message";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const DEBOUNCE_DELAY = 500;

const PartyBalance = () => {
  const [search, setSearch] = useState<string>("");
  const [parties, setParties] = useState<BalancePartyType[]>([]);
  const [filteredParties, setFilteredParties] = useState<BalancePartyType[]>(
    []
  );
  const [searchParty, setSearchParty] = useState<BalancePartyType | null>(null);
  const [partyVehicleEntries, setPartyVehicleEntries] = useState<
    VehicleEntryType[] | null
  >(null);
  let pendingTotal = 0,
    receivedTotal = 0;

  const dispatch = useDispatch();

  const fetchAllBalanceParties = useCallback(async () => {
    try {
      const response = await api.get("/balance-party/all-balance-parties");
      const data: BalancePartyType[] = response.data.data;
      setParties(data);
    } catch (error: any) {
      dispatch(
        addMessage({
          type: "error",
          text:
            error.response?.data?.message || "Failed to fetch balance parties",
        })
      );
      console.error("Failed to fetch balance parties", error.response);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllBalanceParties();
  }, [fetchAllBalanceParties]);

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search.trim()) {
        const results = parties.filter((p) =>
          p.party_name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredParties(results);
      } else {
        setFilteredParties([]);
        setSearchParty(null);
        setPartyVehicleEntries(null);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [search, parties]);

  const handlePartySearch = async () => {
    if (searchParty) {
      try {
        const response = await api.get(
          `/vehicle-entry/by-party/${searchParty._id}`
        );
        const data = response.data;
        console.log(data.data);
        setPartyVehicleEntries(data.data);
      } catch (error: any) {
        console.log(error.response);
      }
    }
  };

  const handleSearchCancel = () => {
    setSearchParty(null);
    setFilteredParties([]);
    setSearch("");
    setPartyVehicleEntries(null);
  };

  return (
    <div className={styles.partyBalanceContainer}>
      <div className={styles.searchAndFilterArea}>
        <div className={styles.searchArea}>
          <div className={styles.searchInput}>
            <input
              className={styles.searchParty}
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <span className={styles.cancelBtn} onClick={handleSearchCancel}>
                <FaTimes />
              </span>
            )}
          </div>
          {searchParty && <button onClick={handlePartySearch}>Search</button>}
        </div>
      </div>

      <div className={styles.partyList}>
        {filteredParties.length > 0
          ? filteredParties
              .filter((p) => p._id !== searchParty?._id)
              .map((party) => (
                <motion.div
                  key={party._id}
                  className={styles.partyItem}
                  onClick={() => {
                    setSearchParty(party);
                    setSearch(party.party_name);
                    setFilteredParties([]);
                  }}
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 17,
                    duration: 0.3,
                  }}
                >
                  {party.party_name}
                </motion.div>
              ))
          : !searchParty && <p>Enter Party name for searching parties</p>}
      </div>

      {partyVehicleEntries?.length && (
        <div className={styles.partyVehicleEntries}>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  {(
                    Object.entries(VEHICLE_ENTRY_LABELS) as [
                      keyof BalancePartyType,
                      string
                    ][]
                  ).map(([key, label]) => {
                    return <th key={key}>{label}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {partyVehicleEntries.map((entry) => {
                  pendingTotal += parseInt(entry.balance);
                  receivedTotal += parseInt(entry.in_ac);
                  return (
                    <tr key={entry._id}>
                      {(
                        Object.entries(VEHICLE_ENTRY_LABELS) as [
                          keyof VehicleEntryType,
                          string
                        ][]
                      ).map(([key, _]) => {
                        const value =
                          (key as string) === "balance_party"
                            ? entry["balance_party"].party_name
                            : entry[key];
                        return <td key={key}>{value as string}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className={styles.totalBalanceArea}>
            <div className={styles.total}>
              <span>Pending Total:</span> {pendingTotal}
            </div>
            <div className={styles.total}>
              <span>Received Total:</span> {receivedTotal}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyBalance;
