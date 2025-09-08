import type { BillingPartyType } from "../types/party";
import type { FilterConfig } from "./filter";

export const BillingPartyFilters: FilterConfig<BillingPartyType>[] = [
    { field: "name", type: "text", label: "Billing Party Name" }
]