import { successResponse } from '../utils/response.js';
import Entry from '../models/entryModel.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

const addNewEntry = async (req, res, next) => {
    const { extra_charges, ...rest } = req.body;
    const charges = [];

    if (Array.isArray(extra_charges)) {
        extra_charges.forEach((charge) => {
            charges.push({
                type: charge.type,
                amount: charge.amount,
                rate: charge.rate,
                per_amount: charge.per_amount
            });
        });
    }

    const newEntry = await Entry.create({
        ...rest,
        extra_charges: charges
    });
    if (!newEntry) {
        return next(new AppError("Failed to create new entry", 400))
    }

    return successResponse(res, "Entry Added Successfully");
}

const getAllEntries = async (req, res) => {
    const entries = await Entry.find();

    return successResponse(res, "", entries);
}

const updateEntry = async (req, res, next) => {
    const entryId = req.params.id;
    const updatedEntry = req.body;

    const { extra_charges, ...rest } = updatedEntry;
    const charges = [];

    if (Array.isArray(extra_charges)) {
        extra_charges.forEach((charge) => {
            charges.push({
                type: charge.type,
                amount: charge.amount,
                rate: charge.rate,
                per_amount: charge.per_amount
            });
        });
    }

    if (!mongoose.Types.ObjectId.isValid(entryId)) {
        return next(new AppError("Invalid Entry ID", 400));
    }

    const entry = await Entry.findByIdAndUpdate(entryId, { ...rest, extra_charges: charges }, { new: true });

    if (!entry) {
        return next(new AppError("Entry not found", 404));
    }

    return successResponse(res, "Entry Updated Successfully", entry);
}

const searchEntryByParam = async (req, res, next) => {
    const query = {};

    for (const [key, value] of Object.entries(req.query)) {
        if (!value) continue;

        const values = value.split(",").map((v) => v.trim());
        query[key] = {
            $in: values.map((v) => new RegExp(v, "i"))
        };
    }

    const entries = await Entry.find(query);

    return successResponse(res, "", entries);
}

const findEntryById = async (req, res, next) => {
    const lrNumber = req.params.id;

    if (lrNumber.length < 0) {
        return next(new AppError("Please fill LR Number", 401));
    }

    const entry = await Entry.find({ lr_no: lrNumber });

    if (!entry) {
        return next(new AppError("No entry found with the entered LR Number"));
    }
    
    return successResponse(res, "", entry);
}

export { addNewEntry, getAllEntries, updateEntry, searchEntryByParam, findEntryById }