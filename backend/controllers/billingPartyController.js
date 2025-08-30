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

    console.log(name, address, gst_no);

    console.log(partyId);
    return successResponse(res, "Billing Party Updated");
}

export { addBillingParty, getAllParties, updateParty };