import type { RootState } from "../../app/store";

export const selectBalancePartyLoading = (state: RootState) => state.balanceParty.loading;