const express = require( 'express' );
const bcrypt = require( 'bcryptjs' );
const moment = require( 'moment' );
const userModel = require( '../../models/lecturer.model' );
const auth = require( '../../middlewares/lecturerauth.mdw' );
const passport = require( '../../config/passport.config' );
const router = express.Router();

router.get( '/login', async function ( req, res )
{
  console.log( 'login' );
  req.session.role = null;
  req.logout();
  if ( req.headers.referer )
    req.session.retUrl = req.headers.referer;


  res.render( 'vwLecturers/login', {
    layout: false
  } );
} );


router.post( '/login', async function ( req, res, next )
{
  passport.authenticate( 'lecturer', function ( err, user, info )
  {
    if ( err ) { return res.render( 'vwLecturers/login', { layout: false, err_message: 'Invalid username or password1.' } ); }
    if ( !user ) { return res.render( 'vwLecturers/login', { layout: false, err_message: info.message } ); }
    req.login( user, function ( err )
    {
      if ( err ) { return res.render( 'vwLecturers/login', { layout: false, err_message: 'Invalid username or password3.' } ); }

      req.session.role = 'lecturer';
      let url = req.session.retUrl || '/';
      res.redirect( url );
    } );
  } )( req, res, next );
} ),


  router.post( '/logout', async function ( req, res )
  {
    req.logout();
    req.session.isAuth = false;
    req.session.authUser = null;
    req.session.role = null;
    req.session.cart = [];
    res.redirect( '/' );
  } );



router.get( '/activate', async function ( req, res )
{
  const secret = req.query.key;
  const user = {
    l_Username: req.query.l_Username,
    l_Password: req.query.l_Password,
    l_DOB: req.query.l_DOB,
    l_Name: req.query.l_Name,
    l_Email: req.query.l_Email,
    // permission: 0
  };


  let isActive = bcrypt.compareSync( user.l_Username, secret );
  if ( isActive )
  {
    await userModel.add( user );
    return res.json( true );
  }

  res.json( false );
} );

router.get( '/is-available', async function ( req, res )
{
  const username = req.query.user;
  const email = req.query.email;
  const user1 = await userModel.singleByUserName( username );
  const user2 = await userModel.singleByEmail( email );
  if ( user1 === null && user2 === null )
    return res.json( true );

  res.json( false );
} );

router.get( '/profile', auth, async function ( req, res )
{
  let userInfo = req.user;
  if ( userInfo !== null )
    userInfo.l_DOB = moment( userInfo.l_DOB, 'DD/MM/YYYY' ).format( 'MM-DD-YYYY' );
  console.log( userInfo );
  res.render( 'vwLecturers/profile', {
    userInfo,
  } );
} );

router.post( '/profile', auth, async function ( req, res )
{
  // const hash = bcrypt.hashSync(req.body.password, 10);
  const dob = moment( req.body.dob, 'MM/DD/YYYY' ).format( 'YYYY-MM-DD' );
  // let user = req.user;

  const user = {
    // l_Username: req.body.username,
    // l_Password: hash,
    l_DOB: dob,
    l_Name: req.body.name,
    l_Email: req.body.email,
    // permission: 0
  };
  console.log( user );

  await userModel.update( user, req.user.l_ID );
  res.redirect( '/lecturer/account/profile' );
} );

router.get( '/change-password', auth, async function ( req, res )
{
  res.render( 'vwLecturers/change-password', {
    layout: false
  } );
} );


router.post( '/change-password', auth, async function ( req, res )
{
  if ( !bcrypt.compareSync( req.body.oldpassword, req.user.l_Password ) )
  {
    return res.render( 'vwLecturers/change-password', { layout: false, err_message: 'Wrong old password!!!' } );
  }
  if ( req.body.newpassword !== req.body.confirmpassword )
  {
    return res.render( 'vwLecturers/change-password', { layout: false, err_message: 'Confirm Password not match!!!' } );
  }
  const user = {
    l_Password: bcrypt.hashSync( req.body.newpassword, 10 ),
  };
  await userModel.update( user, req.user.l_ID );
  req.logout();
  res.redirect( '/lecturer/account/login' );
} );

module.exports = router;