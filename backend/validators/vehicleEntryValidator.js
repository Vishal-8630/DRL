import { body, validationResult } from 'express-validator';

export const vehicleEntryValidation = [
    body('date')
        .notEmpty().withMessage('Date is required'),
    body('vehicle_no')
    .notEmpty().withMessage("Vehicle Number is required"),
    body('from')
    .notEmpty().withMessage('From is required'),
    body('to')
    .notEmpty().withMessage('To is required'),
    body('freight')
    .notEmpty().withMessage('Freight is required'),
    body('driver_cash')
    .notEmpty().withMessage('Driver Cash is required'),
    body('dala')
    .notEmpty().withMessage('Dala is required'),
    body('kamisan')
    .notEmpty().withMessage('Kamisan is required'),
    body('in_ac')
    .notEmpty().withMessage('In AC is required'),
    body('halting')
    .notEmpty().withMessage('Halting is required'),
    body('balance')
    .notEmpty().withMessage('Balance is required'),
    body('owner')
    .notEmpty().withMessage('Owner is required'),
    body('status')
    .notEmpty().withMessage('Status is required'),

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