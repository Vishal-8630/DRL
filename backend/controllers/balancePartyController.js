import BalanceParty from "../models/balanceParty.js";
import { successResponse } from "../utils/response.js";

const newBalanceParty = async (req, res, next) => {
    const { party_name } = req.body;
    const party = new BalanceParty({ party_name });
    if (!party) {
        return next(new AppError("Failed to create new balance party", 400));
    }
    await party.save();
    return successResponse(res, "Balance Party Added Successfully");
};

const getAllBalanceParties = async (req, res) => {
    const balanceParties = await BalanceParty.find();
    return successResponse(res, "", balanceParties);
};

export { newBalanceParty, getAllBalanceParties };