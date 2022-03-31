const lecturerModel = require( '../models/lecturer.model' );
const courseModel = require( '../models/course.model' );



module.exports = {
    auth ()
    {
        return async function ( req, res, next )
        {
            const CourseID = req.params.id;
            const lecturers = await courseModel.getLecturersOfCourse( CourseID );
            let accessible = false;
            for ( const lecturer of lecturers )
                if ( lecturer.l_ID === req.user.l_ID )
                {
                    accessible = true;
                    break;
                }
            if ( accessible === false )
                return res.redirect( '/lecturer/courses/' );
            next();
        };
    },
};