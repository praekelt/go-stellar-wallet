var WalletModel = require('../models/wallet');
var Validator = require('validator');
var Restify = require('restify');

var wallet = {
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
        else if (!Validator.isMobilePhone(msisdn, 'en-ZA')) {
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
                next();
            });
        
    },
};
module.exports = wallet;
