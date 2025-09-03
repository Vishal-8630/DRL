import express from "express";
import {
  newBillingParty,
  getAllBillingParties,
  updateBillingParty,
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

export default router;
