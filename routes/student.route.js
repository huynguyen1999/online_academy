const express = require( 'express' );
const moment = require( 'moment' );
const router = express.Router();
const courseModel = require( '../models/course.model' );
const studentModel = require( '../models/students.model' );
const courseAuth = require( '../middlewares/studentCourseAuth.mdw' );

router.get( '/', async function ( req, res )
{
    res.redirect( '/student/courses' );
} );

router.get( '/learn', courseAuth, async function ( req, res )
{
    const CourseID = req.query.id;
    const s_ID = req.user.s_ID;
    const Chapters = await courseModel.getCourseChapters( CourseID );
    for ( const chapter of Chapters )
        chapter.ChapterProgress = await courseModel.getChapterTime( chapter.ChapterID, s_ID );
    //console.log( Chapters );
    res.render( 'vwStudents/learn', {
        chapters: Chapters,
        firstChapterID: Chapters[ 0 ].ChapterID
    } );
} );

router.post( '/save', async function ( req, res )
{
    data = JSON.parse( req.body );
    console.log( 'save progress' );
    let currentIndex = 0;
    let Chapters = [];
    let chapter = new Object();

    for ( const dat of data )
    {
        const datIndex = dat.name.match( /\d+/g );
        if ( datIndex > currentIndex )
        {
            Chapters.push( chapter );
            delete chapter;
            chapter = new Object();
            currentIndex = datIndex;
        }
        const property = dat.name.match( /(ChapterID)|(Time)|(EnrollDetails_ID)|(Done)/g );
        chapter[ property ] = dat.value;
    }
    Chapters.push( chapter );
    await studentModel.addEnrollDetails( Chapters, req.user.s_ID );
    res.status( 200 ).send( { message: 'OK' } );
} );

router.get( '/courses', async function ( req, res )
{
    res.locals.studentMenuOption = 1;
    const StudentCourses = await studentModel.getStudentCourses( req.user.s_ID );
    //console.log( StudentCourses );
    res.render( 'vwStudents/courses',
        { courses: StudentCourses }
    );
} );

router.get( '/watchlist', async function ( req, res )
{
    res.locals.studentMenuOption = 2;
    const StudentWatchlist = await studentModel.getStudentWatchlist( req.user.s_ID );
    //console.log( StudentWatchlist );
    res.render( 'vwStudents/watchlist',
        { courses: StudentWatchlist } );
} );

router.post( '/addFav', async function ( req, res )
{
    await studentModel.addIntoWatchlist( req.body );
    res.redirect( req.headers.referer );
} );
router.post( '/remFav', async function ( req, res )
{
    //console.log( req.body );
    await studentModel.removeFromWatchlist( req.body );
    res.redirect( req.headers.referer );
} );

router.post( '/buy', async function ( req, res )
{
    //console.log( req.body );
    const CourseID = req.body.buy_id;
    await studentModel.addCourse( CourseID, req.user.s_ID );
    res.redirect( req.headers.referer );
} );
router.post( '/feedback', async function ( req, res )
{
    await studentModel.addReview( req.body );
    res.redirect( req.headers.referer );
} );
module.exports = router;