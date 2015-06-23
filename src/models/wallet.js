var StellarBase = require('stellar-base');
var Ed25519 = require('ed25519');
var Sjcl = require('sjcl');

var DbUtil = require('../utils/db');
var CryptoUtil = require('../utils/crypto');

var wallet = {
    
    create: function(msisdn, pin) {
        var salt = Sjcl.codec.base64.fromBits(Sjcl.random.randomWords(64/4));
        var key = this._generateKeyPair();
        var privateKey = key.privateKey;
        var publicKey = key.publicKey;
        var encryptionKey = pin;
        var pinHash = CryptoUtil.hash(pin, salt);
        var privateKeyEncrypted = CryptoUtil.encryptData(privateKey, encryptionKey);
        var address = this.addressFromPublicKey(publicKey);

        return DbUtil.promiseConnection()
            .then(DbUtil.chainedQuery(
                "INSERT INTO wallet ( msisdn, address, publickey, privatekey, pinhash, salt) VALUES ( $1, $2, $3, $4, $5, $6)",
                [msisdn, pinHash, address, publicKey, privateKeyEncrypted, salt]))
            .then(function(successResult) {
                return {
                    success: true,
                    publicKey: publicKey,
                    privateKey: privateKey,
                    address: address
                };
            }, function(failureResult) {
                return {
                    success: false
                };
            });
    },

    addressFromPublicKey: function(publicKey) {
        var publicKeyBytes = new Buffer(publicKey, 'base64');
        var keyPair = new StellarBase.Keypair({publicKey: publicKey});
        return keyPair.address();
    },

    _generateKeyPair: function() {
        seed = new Buffer(Sjcl.random.randomWords(32), 'base64');
        // generate an elliptic curve key pair (http://ed25519.cr.yp.to/)
        var keyPair = Ed25519.MakeKeypair(seed)

        return {
            publicKey: keyPair.publicKey.toString('base64'),
            privateKey: keyPair.privateKey.toString('base64'),
        };
    }
};
module.exports = wallet;
