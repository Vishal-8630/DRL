import express from 'express';
import { getAllBalanceParties, newBalanceParty, updateBalanceParty } from '../controllers/balancePartyController.js';
import { balancePartyValidations } from '../validators/balancePartyValidator.js';

const router = express.Router();

router.post('/new-balance-party', balancePartyValidations, newBalanceParty);
router.get('/all-balance-parties', getAllBalanceParties);
router.put('/:id', updateBalanceParty);

export default router;