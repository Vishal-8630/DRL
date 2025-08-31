import BillingParty from '../models/billingPartyModel.js';
import { successResponse } from '../utils/response.js';

const addBillingParty = async (req, res, next) => {
    const { name, address, gst_no } = req.body;
    const party = new BillingParty({
        name,
        address,
        gst_no
    });
    await party.save();
    return successResponse(res, "Billing Party Added", {});
}

const getAllParties = async (req, res) => {
    const parties = await BillingParty.find();
    return successResponse(res, "", parties);
}

const updateParty = async (req, res, next) => {
    const partyId = req.params.id;
    const { name, address, gst_no } = req.body;

    const party = await BillingParty.findByIdAndUpdate(partyId, {
        name,
        address,
        gst_no
    }, { new: true });

    if (!party) {
        return next(new AppError("Billing Party not found", 404));
    }
    return successResponse(res, "Billing Party Updated");
}

export { addBillingParty, getAllParties, updateParty };