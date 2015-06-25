var Sequelize = require('sequelize');
var Config = require('../config');

var sequelize = new Sequelize('stellar-wallet', 'stellar-wallet', 'stellar-wallet', {
    dialect: 'postgres',
    });

module.exports = {
    sequelize: sequelize
};
