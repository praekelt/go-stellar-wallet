var WalletModel = require('../models/wallet');
var Validator = require('validator');
var Restify = require('restify');

var Wallet = {
    create: function(req, res, next) {
        var params = Wallet._parseWalletParams(req);

        if (params.error_message != '') {
            return next(new Restify.BadRequestError(params.error_message));
        }

        WalletModel.create(params.msisdn, params.pin)
            .done(function(result) {
                // data from the model is good enough
                res.send(JSON.stringify(result));
                next();
            });
        
    },

    fetch: function(req, res, next) {
        var auth_headers = Wallet._parseAuthorizationHeader(req);
        var params = Wallet._parseWalletParams(
            req,
            auth_headers.msisdn,
            auth_headers.pin);

        var error_message = auth_headers.error_message || params.error_message
        if (error_message != '') {
            return next(new Restify.BadRequestError(error_message));
        }

        WalletModel.fetch(params.msisdn, auth_headers.pin)
            .done(function(result) {
                res.send(JSON.stringify(result));
                next();
            });
    },

    _parseAuthorizationHeader: function(req) {
        var error_message = '';
        if (req.headers.authorization === undefined) {
            return {
                error_message: 'Please enter your pin to fetch this wallet'
            };
        } 
        var auth_header = req.headers.authorization.split(' ');
        if (auth_header[0] != 'Basic') {
            return {
                error_message: 'Please use basic authentication'
            };
        }
        var auth_header_decoded = new Buffer(auth_header[1], 'base64')
                                    .toString()
                                    .split(':');
        return {
            error_message: '',
            msisdn: auth_header_decoded[0],
            pin: auth_header_decoded[1]
        };
    },


    _parseWalletParams: function(req, msisdn, pin) {
        var error_message = '';
        // NOTE: request must have content-type set application/json 
        // or application/x-www-form-urlencoded
        if (req.params) {
            msisdn = req.params['msisdn'] || msisdn;
            pin = req.params['pin'] || pin;
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

        return {
            msisdn: msisdn,
            pin: pin,
            error_message: error_message
        };
    },
};
module.exports = Wallet;
