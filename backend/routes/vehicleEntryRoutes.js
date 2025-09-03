import express from "express";
import {
  addNewVehicleEntry,
  getAllVehicleEntries,
  searchVehicleEntryByParty,
  updateVehicleEntry,
} from "../controllers/vehicleEntryController.js";
import { vehicleEntryValidation } from "../validators/vehicleEntryValidator.js";

const router = express.Router();

router.post("/new-vehicle-entry", vehicleEntryValidation, addNewVehicleEntry);
router.get("/all-vehicle-entries", getAllVehicleEntries);
router.get("/by-party/:id", searchVehicleEntryByParty);
router.post(
  "/update-vehicle-entry/:id",
  vehicleEntryValidation,
  updateVehicleEntry
);

export default router;
