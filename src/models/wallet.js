var StellarBase = require('stellar-base');
var Ed25519 = require('ed25519');
var Sjcl = require('sjcl');

var CryptoUtil = require('../utils/crypto');
var sequelize = require('./db').sequelize;
var Sequelize = require('sequelize');

var Wallet = {
    Wallet: sequelize.define('wallet', {
        msisdn: {
            type: Sequelize.STRING,
            unique: true
        },
        address: {
            type: Sequelize.STRING,
            unique: true
        },
        publickey: {
            type: Sequelize.STRING(2000)
        },
        privatekey: {
            type: Sequelize.STRING(2000)
        },
        pinhash: {
            type: Sequelize.STRING
        },
        salt: {
            type: Sequelize.STRING
        },
    }),


    /**
     * Fetch just the address corresponding to an MSISDN
     */
    fetchAddress: function(msisdn) {
        return this.Wallet.findOne({
            where: {
                msisdn: msisdn
            }
        }).then(function(dbResult) {
            if(!dbResult) {
                return {
                    error_message: 'No such wallet exists'
                };
            }
            var data = dbResult.dataValues;
            return {
                msisdn: data.msisdn,
                address: data.address,
                error_message: ''
            };
        });
    },
    /**
     * Lookup wallet and decrypt private key
     */
    fetch: function(msisdn, pin) {
        // fetch salt, calculate pin hash, validate pin hash
        return this.Wallet.findOne({
            where: {
                msisdn: msisdn
            }
        }).then(function(dbResult) {
            if(!dbResult) {
                return {
                    error_message: 'No such wallet exists'
                };
            }
            var data = dbResult.dataValues;
            var computedPinHash = CryptoUtil.hash(pin, data.salt);
            if (data.pinhash === computedPinHash) {
                // yay, pin is correct we can now decrypt private key
                return {
                    msisdn: data.msisdn,
                    address: data.address,
                    privatekey: CryptoUtil.decryptData(data.privatekey, pin),
                    publickey: data.publickey,
                    salt: data.salt
                };
            } else {
                return {
                    error_message: 'Incorrect pin'
                };
            }
        });
    },
    
    /**
     * Create a wallet and add it to db
     */
    create: function(msisdn, pin) {
        var salt = Sjcl.codec.base64.fromBits(Sjcl.random.randomWords(64/4));
        var key = StellarBase.Keypair.random();
        var privateKey = key._secretKey.toString('base64');
        var publicKey = key._publicKey.toString('base64');
        var encryptionKey = pin;
        var pinHash = CryptoUtil.hash(pin, salt);
        var privateKeyEncrypted = CryptoUtil.encryptData(privateKey, encryptionKey);
        var address = key.address();

        return this.Wallet.create({
            msisdn: msisdn,
            address: address,
            publickey: publicKey,
            privatekey: privateKeyEncrypted,
            pinhash: pinHash,
            salt: salt
        }).then(function(result) {
            return {
                success: true,
                publicKey: publicKey,
                privateKey: privateKey,
                address: address
            };
        }, function(error) {
            return {
                success: false,
                errorMessage: error.errors[0].message
            };
        });
    },
};
module.exports = Wallet;
