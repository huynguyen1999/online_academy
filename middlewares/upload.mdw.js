const multer = require( 'multer' );
const storage = multer.diskStorage( {
    destination: function ( req, file, callback )
    {
        let isnum = /^\d+$/.test( file.fieldname );
        if ( isnum )
            callback( null, './public/images' );
        else callback( null, './public/videos' );
    },
    filename: function ( req, file, callback )
    {
        let filename = file.fieldname;
        let isTail = false;
        for ( let i = 0; i < file.mimetype.length; i++ )
        {
            if ( isTail ) filename += file.mimetype[ i ];
            if ( file.mimetype[ i ] == '/' )
            {
                filename += '.';
                isTail = true;
            }
        }
        callback( null, filename );
    }
} );
const upload = multer( { storage } );
module.exports = upload;