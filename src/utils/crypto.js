var Sjcl = require('sjcl');


var Crypto = {
    hash: function(data, salt) {
        salt = salt || '';
        var subject = data+salt;
        var hashed = Sjcl.hash.sha256.hash(subject);

        return Sjcl.codec.base64.fromBits(hashed);
    },
    // mostly from stellar-wallet-js-sdk (let's not mess with crypto
    // too much)
    encryptData: function (data, key) {
      var cipherName = 'aes';
      var modeName = 'gcm';

      var cipher = new Sjcl.cipher[cipherName](key);
      var rawIV = Sjcl.random.randomWords(3);
      var encryptedData = Sjcl.mode[modeName].encrypt(
        cipher,
        Sjcl.codec.utf8String.toBits(data),
        rawIV
      );

      data = JSON.stringify({
        IV: Sjcl.codec.base64.fromBits(rawIV),
        cipherText: Sjcl.codec.base64.fromBits(encryptedData),
        cipherName: cipherName,
        modeName: modeName
      });

      return base64Encode(data);
    },

    decryptData: function (encryptedData, key) {
        var rawCipherText, rawIV, cipherName, modeName;

        try {
            var resultObject = JSON.parse(base64Decode(encryptedData));
            rawIV = Sjcl.codec.base64.toBits(resultObject.IV);
            rawCipherText = Sjcl.codec.base64.toBits(resultObject.cipherText);
            cipherName = resultObject.cipherName;
            modeName = resultObject.modeName;
        } catch(e) {
            throw new Error('Unable to decrypt '+e);
        }

        var cipher = new Sjcl.cipher[cipherName](key);
        var rawData = Sjcl.mode[modeName].decrypt(cipher, rawCipherText, rawIV);
        return Sjcl.codec.utf8String.fromBits(rawData);
    }
};


function base64Encode(str) {
  return (new Buffer(str)).toString('base64');
}
function base64Decode(str) {
  return (new Buffer(str, 'base64')).toString();
}


module.exports = Crypto;
