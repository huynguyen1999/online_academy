module.exports = function auth ( req, res, next )
{
  // console.log( req.isAuthenticated() );
  if ( req.isAuthenticated() === false )
  {
    req.session.retUrl = req.originalUrl;
    return res.redirect( '/account/login' );
  }
  if ( req.session.role === 'lecturer' )
    return res.redirect( req.headers.referer || '/' );
  next();
};