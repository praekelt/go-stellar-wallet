var Pg = require('pg');
var Config = require('../config');
var Promise = require('promise');

var db = {
    /**
     * Helper function that returns a promise of a db connection
     */
    promiseConnection: function() {
        return new Promise(function(resolve, reject) {
            Pg.connect(Config.POSTGRES_SERVER, function(err, client, done) {
                if(err) {
                    done(client);
                    reject(err);
                } else {
                    resolve({client: client, done: done});
                }
            });
        });
    },
    /**
     * Helper function that converts the result of a postgres
     * query to a promise
     */
    promiseQuery: function(connection, query, values) {
        return new Promise(function(resolve, reject) {
            connection.client.query(
                {
                    text: query,
                    values: values || []
                }, 
                function(error, result) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
            });
        });
    },

    /**
     * Helper funciton to be chained below a promiseConnectoin
     */
    chainedQuery: function(query, values) {
        return function(connection) {
            return this.promiseQuery(connection, query, values)
        }.bind(this);
    }
};
module.exports = db;
