describe("Wallet", function() {
    var WalletModel = require('../../models/wallet');
    var WalletController = require('../../controllers/wallet');
    var fake_wallet;

    var fake_msisdn = '0761234567';
    var fake_pin = '123456';

    beforeAll(function() {
        spyOn(WalletModel.Wallet, 'findOne').and.callFake(function(opts) {
            if (opts.where.msisdn == fake_msisdn) {
                return Promise.resolve({
                    dataValues: fake_wallet
                });
            }
            return Promise.resolve(undefined);
        });
        spyOn(WalletModel.Wallet, 'create').and.callFake(function(data) {
            fake_wallet = data;
            expect(fake_wallet.salt).toBeDefined();
            return Promise.resolve(true)
        });
    });

    it("creates a wallet", function(done) {
        WalletModel.create(fake_msisdn, fake_pin)
            .then(function(result) {
                expect(result.success).toEqual(true);
                expect(result.publicKey).toEqual(fake_wallet.publickey);
                expect(result.address).toBeDefined();
                done();
            }.bind(this));
    });

    it("fetches and decrypts wallet (incorrect pin)", function(done) {
        // incorrect pin
        WalletModel.fetch(fake_msisdn, '321321')
            .then(function(data) {
                expect(data.error_message).toEqual('Incorrect pin');
                done();
            });
    });

    it("fetches and decrypts wallet", function(done) {
        WalletModel.fetch(fake_msisdn, fake_pin)
            .then(function(data) {
                expect(data.msisdn).toEqual(fake_msisdn);
                done();
            });
    });

    it("invalid wallet", function(done) {
        WalletModel.fetch('123', '123')
            .then(function(data) {
                expect(data.error_message).toEqual('No such wallet exists');
                done();
            });
    });
    it("wallet create controller", function(done) {
        var req = {
            headers: {
                Authorization: 'Basic '+new Buffer(fake_msisdn+':'+fake_pin).toString('base64')
            },
            params: {
                msisdn: fake_msisdn,
                pin: fake_pin
            }
        };
        var res = {send:function(){}};
        WalletController.create(req, res, done);
    });
});

