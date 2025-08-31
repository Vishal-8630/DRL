import { body, validationResult } from 'express-validator';

export const entryValidation = [
    body('bill_no')
        .notEmpty().withMessage('Bill Number is required'),
    body('bill_date')
    .notEmpty().withMessage("Bill Date is required"),
    body('lr_no')
    .notEmpty().withMessage('LR Number is required'),
    body('lr_date')
    .notEmpty().withMessage('LR Date is required'),
    body('consignor_name')
    .notEmpty().withMessage('Consignor Name is required'),
    body('consignor_from_address')
    .notEmpty().withMessage('Consignor From Address is required'),
    body('consignor_gst_no')
    .notEmpty().withMessage('Consignor GST Number is required'),
    body('consignee')
    .notEmpty().withMessage('Consignee is required'),
    body('consignor_to_address')
    .notEmpty().withMessage('Consignor To Address is required'),
    body('vehicle_no')
    .notEmpty().withMessage('Vehicle Number is required'),
    body('from')
    .notEmpty().withMessage('From is required'),
    body('to')
    .notEmpty().withMessage('To is required'),
    body('weight')
    .notEmpty().withMessage('Weight is required'),
    body('fixed')
    .notEmpty().withMessage('Fixed is required'),
    body('mode_of_packing')
    .notEmpty().withMessage('Mode Of Packing is required'),
    body('invoice_no')
    .notEmpty().withMessage('Invoice Number is required'),
    body('description_of_goods')
    .notEmpty().withMessage('Description Of Goods is required'),
    body('value')
    .notEmpty().withMessage('Value is required'),
    body('name_of_clerk')
    .notEmpty().withMessage('Name Of Clerk is required'),
    body('to_be_billed_at')
    .notEmpty().withMessage('To Be Billed At is required'),
    body('risk')
    .notEmpty().withMessage('Risk is required'),
    body('address_of_billing_office')
    .notEmpty().withMessage('Address Of Billing Office is required'),
    body('rate')
    .notEmpty().withMessage('Rate is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array().reduce((acc, err) => {
                    acc[err.path] = err.msg;
                    return acc;
                }, {})
            })
        }
        next();
    }
]