import express from 'express';
import { addBillingParty, getAllParties, updateParty } from '../controllers/billingPartyController.js';
import { billingPartyValidation } from '../validators/billingPartyValidator.js';

const router = express.Router();

router.post('/add-party', billingPartyValidation, addBillingParty);
router.get("/all-parties", getAllParties);
router.post("/update-party/:id", billingPartyValidation, updateParty);

export default router;