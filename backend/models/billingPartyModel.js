import mongoose from 'mongoose';

const billingPartySchema = mongoose.Schema({
    name: {
        type: String
    },
    address: {
        type: String
    },
    gst_no: {
        type: String
    }
});

const BillingParty = mongoose.model("BillingParty", billingPartySchema);
export default BillingParty;