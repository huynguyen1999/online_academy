const studentModel = require( '../models/students.model' );
module.exports = async function auth ( req, res, next )
{
    const CourseID = req.query.id;
    const s_ID = req.user.s_ID;
    console.log( CourseID + ' ' + s_ID );
    const enrollment = await studentModel.getEnroll( s_ID, CourseID );
    if ( enrollment === null ) return res.redirect( req.headers.referer || '/' );
    next();
};