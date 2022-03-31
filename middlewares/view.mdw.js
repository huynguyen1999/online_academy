const exphbs = require( 'express-handlebars' );
const hbs_sections = require( 'express-handlebars-sections' );
const numeral = require( 'numeral' );

module.exports = function ( app )
{
  app.engine( 'hbs', exphbs( {
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    layoutsDir: 'views/_layouts',
    partialsDir: 'views/_partials',
    helpers: {
      section: hbs_sections(),

      compare ( a, b )
      {
        if ( a == b ) return true;
        return null;
      },
      format ( val )
      {
        return numeral( val ).format( '0,0' );
      },
      change ( val, x )
      {
        val = x;
      }
      ,
      add ( a, b )
      {
        return a + b;
      },
      ifeq: function ( a, b, options )
      {
        if ( a == b )
          return options.fn( this );
        return options.inverse( this );
      },
      ifnoteq: function ( a, b, options )
      {
        if ( a == b )
        {
          return options.inverse( this );
        }
        return options.fn( this );
      }
    }
  } ) );
  app.set( 'view engine', 'hbs' );
};