import type { RootState } from "../../app/store";

export const selectVehicleLoading = (state: RootState) => state.vehicle.loading;