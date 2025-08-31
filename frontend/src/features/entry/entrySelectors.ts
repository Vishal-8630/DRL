import type { RootState } from "../../app/store";

export const selectEntryLoading = (state: RootState) => state.entry.loading;