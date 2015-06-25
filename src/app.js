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

server.listen(Config.PORT, function() {
	console.log('Listening for requests');
});
