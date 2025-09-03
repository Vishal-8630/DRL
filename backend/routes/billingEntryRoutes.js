import express from "express";
import {
  addNewBillingEntry,
  findBillingEntryById,
  getAllBillingEntries,
  searchBillingEntryByParam,
  updateBillingEntry,
} from "../controllers/billingEntryController.js";
import { billingEntryValidations } from "../validators/billingEntryValidator.js";

const router = express.Router();

router.post("/new-billing-entry", billingEntryValidations, addNewBillingEntry);
router.get("/all-billing-entries", getAllBillingEntries);
router.post(
  "/update-billing-entry/:id",
  billingEntryValidations,
  updateBillingEntry
);
router.get("/", searchBillingEntryByParam);
router.get("/:id", findBillingEntryById);

export default router;
