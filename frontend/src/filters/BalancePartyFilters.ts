import type { BalancePartyType } from "../types/vehicle";
import type { FilterConfig } from "./filter";

export const BalancePartyFilters: FilterConfig<BalancePartyType>[] = [
    { field: "party_name", type: "text", label: "Balance Party Name" }
]