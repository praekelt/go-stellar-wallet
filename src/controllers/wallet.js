var Validator = require('validator');
var Restify = require('restify');

var WalletModel = require('../models/wallet');
var Config = require('../config');

var wallet = {
    /**
     * View method for POST /v1/wallet
     *
     * Body arguments (JSON or urlencoded)
     * msisdn - currently limited to one locale (set in Config.VALIDATION_COUNTRY)
     * pin - integer at least 5 digits
     */
    create: function(req, res, next) {
        // NOTE: request must have content-type set application/json 
        // or application/x-www-form-urlencoded
        var error_message = '', msisdn, pin;
        if (req.params) {
            msisdn = req.params['msisdn'];
            pin = req.params['pin'];
        }
        
        if (Object.keys(req.params).length === 0) {
            error_message = 'Please set content-type header approporiately';
        }
        else if (pin === undefined ||
            msisdn === undefined) {
            error_message = 'missing argument';
        }
        // TODO: this shouldn't just be ZA
        else if (!Validator.isMobilePhone(msisdn, Config.VALIDATION_COUNTRY)) {
            error_message = 'not a validate mobile number';
        }
        else if (!Validator.isNumeric(pin)) {
            error_message = 'pin must be numeric';
        }
        else if(pin.length < 5) {
            error_message = 'pin too short, must be at least 5 digits';
        }

        if (error_message != '') {
            return next(new Restify.BadRequestError(error_message));
        }

        var createWalletPromise = WalletModel.create(msisdn, pin)
            .done(function(result) {
                // data from the model is good enough
                res.send(JSON.stringify(result));
                // calls the next handler in the restify chain
                next();
            });
        
    },
};
module.exports = wallet;
