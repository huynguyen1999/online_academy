const { process_params } = require( 'express/lib/router' );
const mysql = require( 'mysql' );
const util = require( 'util' );
require( 'dotenv' ).config();

const pool = mysql.createPool( {
  connectionLimit: process.env.DB_CONNECTION_LIMIT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  charset: 'utf8mb4_bin',
} );

const pool_query = util.promisify( pool.query ).bind( pool );

module.exports = {
  load: sql => pool_query( sql ),
  add: ( entity, tableName ) => pool_query( `insert into ${ tableName } set ?`, entity ),
  del: ( condition, tableName ) => pool_query( `delete from ${ tableName } where ?`, condition ),
  patch: ( entity, condition, tableName ) => pool_query( `update ${ tableName } set ? where ?`, [ entity, condition ] )
};
