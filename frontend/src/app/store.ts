import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { messageReducer } from "../features/message";
import { entryReducer } from "../features/entry";
import { partyReducer } from "../features/party";
import { vehicleReducer } from "../features/vehicle";
import { balancePartyReducer } from "../features/balanceParty";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        messages: messageReducer,
        entry: entryReducer,
        party: partyReducer,
        vehicle: vehicleReducer,
        balanceParty: balancePartyReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;