const categoryModel = require( '../models/category.model' );

module.exports = function ( app )
{
  app.use( async function ( req, res, next )
  {
    res.locals.studentMenuOption = 0;
    res.locals.lecturerMenuOption = 0;

    res.locals.isAuth = req.isAuthenticated();
    res.locals.authUser = req.user;

    res.locals.isStudent = ( req.session.role === 'student' );
    res.locals.isLecturer = ( req.session.role === 'lecturer' );
    res.locals.isAdmin = ( req.session.role === 'admin' );
    
    const parent_cats = await categoryModel.allChild( 0 );
    let cats = [];
    for ( let i = 0; i < parent_cats.length; ++i )
    {
      let cat = {};
      cat[ 'parent' ] = parent_cats[ i ];
      id = +parent_cats[ i ].CatID;
      cat[ 'children' ] = await categoryModel.allChild( id );
      cats.push( cat );
    }
    res.locals.lcCategories = cats;
    next();
  } );

};