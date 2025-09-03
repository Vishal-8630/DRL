import { createSlice } from '@reduxjs/toolkit';

interface balancePartyState {
    loading: boolean;
}

const initialState: balancePartyState = {
    loading: false
}

const balancePartySlice = createSlice({
    name: "balanceParty",
    initialState,
    reducers: {
        balancePartyStart: (state) => {
            state.loading = true;
        },
        balancePartySuccess: (state) => {
            state.loading = false;
        },
        balancePartyFailure: (state) => {
            state.loading = false;
        }
    }
});

export const { balancePartyStart, balancePartySuccess, balancePartyFailure } = balancePartySlice.actions;
export default balancePartySlice.reducer;