import type { BalancePartyType } from "../types/vehicleEntry";
import type { FilterConfig } from "./filter";

export const BalancePartyFilters: FilterConfig<BalancePartyType>[] = [
    { field: "party_name", type: "text", label: "Balance Party Name" }
]