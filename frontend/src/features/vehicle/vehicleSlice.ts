import { createSlice } from "@reduxjs/toolkit";

interface vehicleState {
    loading: boolean;
}

const initialState: vehicleState = {
    loading: false
}

const vehicleSlice = createSlice({
    name: "vehicleEntry",
    initialState,
    reducers: {
        vehicleStart: (state) => {
            state.loading = true;
        },
        vehicleSuccess: (state) => {
            state.loading = false;
        },
        vehicleFailure: (state) => {
            state.loading = false;
        }
    }
});

export const { vehicleStart, vehicleSuccess, vehicleFailure } = vehicleSlice.actions;
export default vehicleSlice.reducer;