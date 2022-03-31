module.exports = function auth ( req, res, next )
{
  //console.log(req.isAuthenticated() === false);
  if ( req.isAuthenticated() === false )
  {
    req.session.retUrl = req.originalUrl;
    return res.redirect( '/lecturer/account/login' );
  }
  if ( req.session.role !== 'lecturer' )
    return res.redirect( req.headers.referer || '/' );
  
  next();
}