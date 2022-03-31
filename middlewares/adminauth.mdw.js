module.exports = function auth(req, res, next) {
    if (req.isAuthenticated() === false || req.session.role !== 'admin') {
      req.session.retUrl = req.originalUrl;
      return res.redirect('/admin/account/login');
    }
    next();
  }