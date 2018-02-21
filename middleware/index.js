//prevent logged in users from accessing uneccessary routes
function loggedOut(req, res, next) {
    if (req.session && req.session.userId) {
        return res.redirect('/profile');
    }
    //if not logged in - continue as usual
    return next();
};

//middleware to password protect any page on a site
function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
      return next();
    } else {
      var err = new Error('You must be logged in to view this page.');
      err.status = 401;
      return next(err);
    }
  }




module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
