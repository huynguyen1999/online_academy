const courseModel = require( '../models/course.model' );
const moment = require( 'moment' );
const lecturerModel = require( '../models/lecturer.model' );
const studentModel = require( '../models/students.model' );
const categoryModel = require( '../models/category.model' );
const studentAuth = require( './studentauth.mdw' );
const lecturerAuth = require( '../middlewares/lecturerauth.mdw' );

module.exports = function ( app )
{

	app.get( '/', async function ( req, res )
	{
		const [ courses, top10views, top10new, hotCourses, hotCat ] = await Promise.all( [
			courseModel.allWithDetails(),
			courseModel.topViews( 10 ),
			courseModel.topNewest( 10 ),
			courseModel.hotCourses(),
			categoryModel.hotCat()
		] );

		res.render( 'home', {
			top10views,
			top10new,
			hotCourses,
			hotCat,
			empty: courses.length === 0
		} );
	} );

	app.get( '/course/:id', async function ( req, res )
	{
		const CourseID = req.params.id;
		const [ _, CourseChapters, CourseLecturers, CourseData, StudentFeedback ] = await Promise.all( [
			courseModel.increaseNumberSeen( CourseID ),
			courseModel.getCourseChapters( CourseID ),
			courseModel.getLecturersOfCourse( CourseID ),
			courseModel.singleWithDetail( CourseID ),
			courseModel.getStudentFeedback( CourseID ),
		] );
		const FiveRelevants = await courseModel.getCoursesByTotalStudents( CourseData.CatID, CourseID, 5 );
		for ( const lecturer of CourseLecturers )
			lecturer.details = await lecturerModel.singleWithDetail( lecturer.l_ID );

		const CurrentUser = req.user;
		if ( typeof ( CurrentUser ) !== 'undefined' )
			CurrentUser.role = req.session.role;

		let Enrollment, Favorite;
		if ( typeof ( CurrentUser ) !== 'undefined' && req.session.role === 'student' )
			[ Favorite, Enrollment ] = await Promise.all( [
				studentModel.getFavorite( CurrentUser.s_ID, CourseID ),
				studentModel.getEnroll( CurrentUser.s_ID, CourseID )
			] );

		let RateStat = new Array( 5 ).fill( 0 );
		for ( const fb of StudentFeedback )
			RateStat[ fb.Rate - 1 ] += 100 * ( 1 / StudentFeedback.length );
		for ( const fb of StudentFeedback )
			RateStat[ fb.Rate - 1 ] = Math.round( RateStat[ fb.Rate - 1 ] );

		res.render( 'course', {
			CourseData,
			CourseLecturers,
			CourseChapters,
			StudentFeedback,
			RateStat,
			FiveRelevants,
			CurrentUser,
			Enrollment,
			Favorite,
		} );
	} );

	app.use( '/lecturer/account', require( '../routes/front/lectureraccount.route' ) );
	app.use( '/account', require( '../routes/front/account.route' ) );
	app.use( '/courses', require( '../routes/courses.route' ) );
	app.use( '/lecturer', lecturerAuth, require( '../routes/lecturer.route' ) );
	app.use( '/student', studentAuth, require( '../routes/student.route' ) );
	app.use( '/admin/account', require( '../routes/front/adminaccount.route' ) );
	app.use( '/admin', require( '../routes/front/admin.route' ) );
};