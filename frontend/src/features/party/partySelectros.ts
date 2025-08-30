import type { RootState } from "../../app/store";

export const selectPartyLoading = (state: RootState) => state.party.loading;