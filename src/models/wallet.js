var StellarBase = require('stellar-base');
var Ed25519 = require('ed25519');
var Sjcl = require('sjcl');

var DbUtil = require('../utils/db');
var CryptoUtil = require('../utils/crypto');

var Wallet = {
    fetch: function(msisdn, pin) {
        // fetch salt, calculate pin hash, validate pin hash
        return DbUtil.promiseConnection()
            .then(DbUtil.chainedQuery(
                "SELECT address, publickey, privatekey, pinhash, salt \
                 FROM wallet \
                 WHERE msisdn = $1", [msisdn]))
            .then(function(result) {
                if (result.result.rows.length == 0) {
                    return {
                        error_message: 'No such user'
                    };
                }
                var row = result.result.rows[0]
                var computedPinHash = CryptoUtil.hash(pin, row.salt);
                if (row.pinhash === computedPinHash) {
                    // yay, pin is correct we can now decrypt private key
                    row.privatekey = CryptoUtil.decryptData(row.privatekey, pin);
                    return row;
                } else {
                    return {
                        error_message: 'Incorrect pin'
                    };
                }
            });
    },
    
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
                "INSERT INTO wallet  \
                    (msisdn, address, publickey, privatekey, pinhash, salt) \
                VALUES ( $1, $2, $3, $4, $5, $6)",
                [msisdn, address, publicKey, privateKeyEncrypted, pinHash, salt]))
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
module.exports = Wallet;
