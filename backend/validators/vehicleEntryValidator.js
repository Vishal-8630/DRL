import { body, validationResult } from 'express-validator';

export const vehicleEntryValidation = [
    body('date')
        .trim().notEmpty().withMessage('Date is required'),
    body('vehicle_no')
        .trim().notEmpty().withMessage("Vehicle Number is required"),
    body('from')
        .trim().notEmpty().withMessage('From is required'),
    body('to')
        .trim().notEmpty().withMessage('To is required'),
    body('freight')
        .trim().notEmpty().withMessage('Freight is required'),
    body('driver_cash')
        .trim().notEmpty().withMessage('Driver Cash is required'),
    body('dala')
        .trim().notEmpty().withMessage('Dala is required'),
    body('kamisan')
        .trim().notEmpty().withMessage('Kamisan is required'),
    body('in_ac')
        .trim().notEmpty().withMessage('In AC is required'),
    body('halting')
        .trim().notEmpty().withMessage('Halting is required'),
    body('balance')
        .trim().notEmpty().withMessage('Balance is required'),
    body('owner')
        .trim().notEmpty().withMessage('Owner is required'),
    body('status')
        .trim().notEmpty().withMessage('Status is required'),

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