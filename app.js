const express = require( 'express' );
var expressSession = require( 'express-session' );
var bodyParser = require( 'body-parser' );
var passport = require( 'passport' );
require( 'dotenv' ).config();
require( 'express-async-errors' );
const app = express();

app.use( bodyParser.json() );
app.use( bodyParser.text() );
app.use( express.urlencoded( {
  extended: true
} ) );

app.use( '/public', express.static( 'public' ) );
require( './middlewares/session.mdw' )( app );
app.use( passport.initialize() );
app.use( passport.session() );


require( './middlewares/view.mdw' )( app );
require( './middlewares/locals.mdw' )( app );
require( './middlewares/routes.mdw' )( app );
require( './middlewares/error.mdw' )( app );


const PORT = process.env.PORT;
app.listen( PORT, function ()
{
  console.log( `Example app listening at http://localhost:${ PORT }` );
} );