import express from "express";
import {
  newBillingParty,
  getAllBillingParties,
  updateBillingParty,
  getBillingPartyByName,
} from "../controllers/billingPartyController.js";
import { billingPartyValidations } from "../validators/billingPartyValidator.js";

const router = express.Router();

router.post("/new-billing-party", billingPartyValidations, newBillingParty);
router.get("/all-billing-parties", getAllBillingParties);
router.post(
  "/update-billing-party/:id",
  billingPartyValidations,
  updateBillingParty
);
router.get("/by-name/:name", getBillingPartyByName);

export default router;
