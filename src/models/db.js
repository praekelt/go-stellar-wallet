var Sequelize = require('sequelize');
var Config = require('../config');

console.log(Config.DB);
var sequelize = new Sequelize('stellar-wallet', 'stellar-wallet', 'stellar-wallet', {
    dialect: 'postgres',
    logging: console.error
    });

sequelize.sync();

module.exports = {
    sequelize: sequelize
};
require('./wallet');
