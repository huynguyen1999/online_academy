const userModel = require( '../models/students.model' );
const adminModel = require( '../models/admin.model' );
const lecturerModel = require( '../models/lecturer.model' );
const LocalStrategy = require( 'passport-local' ).Strategy;
const bcrypt = require( 'bcryptjs' );
const passport = require( 'passport' );

passport.serializeUser( function ( user, done ) //done save data => session
{
    console.log( user );
    if ( user.s_Username !== undefined )
        done( null, { id: user.s_ID, type: 'Student' } );
    else if ( user.l_Username !== undefined )
        done( null, { id: user.l_ID, type: 'Lecturer' } );
    else if ( user.a_Username !== undefined )
        done( null, { id: user.a_ID, type: 'Admin' } );
} );

passport.deserializeUser( function ( obj, done )//obj consists of id and type;
{
    // console.log( 'deserialize user' );
    if ( obj.type === 'Student' )
        userModel.single( obj.id ).
            then( user => done( null, user ) ).
            catch( err => console.log( err ) );
    else if ( obj.type === 'Lecturer' )
        lecturerModel.single( obj.id ).
            then( user => done( null, user ) ).
            catch( err => console.log( err ) );
    else if ( obj.type === 'Admin' )
        adminModel.single( obj.id ).
            then( user => done( null, user ) ).
            catch( err => console.log( err ) );
} );



passport.use( 'admin', new LocalStrategy(
    function ( username, password, done )
    {
        console.log( 'admin strat' );
        adminModel.singleByUserName( username ).then( function ( user )
        {
            bcrypt.compare( password, user.a_Password, function ( err, result )
            {
                if ( err ) { return done( err ); }
                if ( !result )
                {
                    return done( null, false, { message: 'Incorrect username and password' } );
                }
                console.log( password );
                return done( null, user );
            } );
        } ).catch( function ( err )
        {
            return done( err );
        } );
    }
) );
passport.use( 'lecturer', new LocalStrategy(
    function ( username, password, done )
    {
        lecturerModel.singleByUserName( username ).then( function ( user )
        {
            bcrypt.compare( password, user.l_Password, function ( err, result )
            {
                if ( err ) { return done( err ); }
                if ( !result )
                {
                    return done( null, false, { message: 'Incorrect username and password' } );
                }
                if ( user.l_IsActive === 0 )
                {
                    console.log( 'LOCK' );
                    return done( null, false, { message: 'Your Account has been locked' } );
                }
                // console.log(password);
                return done( null, user );
            } );
        } ).catch( function ( err )
        {
            return done( err );
        } );
    }
) );

passport.use( 'student', new LocalStrategy(
    async ( username, password, done ) =>
    {
        console.log( `${ username } - ${ password }` );
        try
        {
            const user = await userModel.singleByUserName( username );
            const similar = await bcrypt.compare( password, user.s_Password );
            if ( !user.s_IsActive )
                return done( null, false, { message: 'Account has been locked!' } );
            if ( !similar )
                return done( null, false, { message: 'Incorrect username or password!' } );
            return done( null, user );
        }
        catch ( error )
        {
            return done( error );
        }
    }
) );
module.exports = passport;