import { createSlice } from "@reduxjs/toolkit";

interface PartyState {
    loading: boolean;
}

const initialState: PartyState = {
    loading: false
}

const partySlice = createSlice({
    name: "party",
    initialState,
    reducers: {
        partyStart: (state) => {
            state.loading = true;
        },
        partySuccess: (state) => {
            state.loading = false;
        },
        partyFailure: (state) => {
            state.loading = false;
        }
    }
});

export const { partyStart, partySuccess, partyFailure } = partySlice.actions;
export default partySlice.reducer;