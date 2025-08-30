import { createSlice } from "@reduxjs/toolkit";

interface entryState {
    loading: boolean;
}

const initialState: entryState = {
    loading: false
}

const entrySlice = createSlice({
    name: "entry",
    initialState,
    reducers: {
        entryStart: (state) => {
            state.loading = true;
        },
        entrySuccess: (state) => {
            state.loading = false;
        },
        entryFailure: (state) => {
            state.loading = false;
        }
    }
});

export const { entryStart, entrySuccess, entryFailure} = entrySlice.actions;
export default entrySlice.reducer;