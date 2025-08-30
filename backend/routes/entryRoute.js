import express from 'express';
import { addNewEntry, findEntryById, getAllEntries, searchEntryByParam, updateEntry } from '../controllers/entryController.js';
import { entryValidation } from '../validators/entryValidator.js';

const router = express.Router();

router.post("/new-entry", entryValidation, addNewEntry);
router.get("/all-entries", getAllEntries);
router.post("/update-entry/:id", entryValidation, updateEntry);
router.get("/", searchEntryByParam); // Search functionality
router.get("/:id", findEntryById);


export default router;