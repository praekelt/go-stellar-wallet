var Restify = require('restify');
var Config = require('./config');
var WalletController = require('./controllers/wallet');
var Db = require('./models/db');

Db.sequelize.sync();

var server = Restify.createServer();

server.use(Restify.acceptParser(server.acceptable));
server.use(Restify.jsonp());
server.use(Restify.bodyParser({ mapParams: true }));


server.post('/v1/wallet', WalletController.create);
server.get('/v1/wallet/:msisdn', WalletController.fetch);
server.get('/v1/wallet/:msisdn/address', WalletController.fetchAddress);

server.listen(Config.PORT, function() {
	console.log('Listening for requests');
});
server.on('uncaughtException', function (req, res, route, err) {
    console.error('uncaughtException', err.stack);
});
