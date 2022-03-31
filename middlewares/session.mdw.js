const express = require( 'express' );
const session = require( 'express-session' );
const { process_params } = require( 'express/lib/router' );
const MySQLStore = require( 'express-mysql-session' )( session );
const dotenv = require( 'dotenv' ).config();
const mysql = require( 'mysql' );

const options = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: process.env.DB_CONNECTION_LIMIT
};

const connection = mysql.createConnection( options );
const sessionStore = new MySQLStore( {
    checkExpirationInterval: 900000,// How frequently expired sessions will be cleared; milliseconds.
    expiration: 86400000,// The maximum age of a valid session; milliseconds.
    createDatabaseTable: true,// Whether or not to create the sessions database table, if one does not already exist.
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, connection );

module.exports = app =>
{
    app.use( session( {
        key: 'keyboard cat',
        secret: 'keyboard cat',
        store: sessionStore,
        resave: true,
        saveUninitialized: true,
        cookie: {}
    } ) );
};