const express = require( 'express' );
const auth = require( '../../middlewares/adminauth.mdw' );
const studentModel = require( '../../models/students.model' );
const lecturerModel = require( '../../models/lecturer.model' );
const categoryModel = require( '../../models/category.model' );
const courseModel = require( '../../models/course.model' );
const moment = require( 'moment' );
const bcrypt = require( 'bcryptjs' );
const router = express.Router();


router.get( '/', auth, async function ( req, res )
{
    res.redirect( '/' );
} );

// students
router.get( '/students', auth, async function ( req, res )
{
    // console.log('admin/students');
    const students = await studentModel.all();

    for ( let i = 0; i < students.length; ++i )
        students[ i ].s_DOB = moment( students[ i ].s_DOB, 'YYYY-MM-DD' ).format( 'DD/MM/YYYY' );

    // console.log(students);
    res.render( 'vwAdmins/students', {
        students
    } );
} );

router.post( '/students/lock/:id', auth, async function ( req, res )
{
    console.log( req.params.id );
    const student = {
        s_IsActive: '0',
    };
    await studentModel.update( student, req.params.id );
    res.redirect( '../' );
} );

router.post( '/students/unlock/:id', auth, async function ( req, res )
{
    console.log( req.params.id );
    const student = {
        s_IsActive: '1',
    };
    await studentModel.update( student, req.params.id );
    res.redirect( '../' );
} );

router.post( '/students/remove/:id', auth, async function ( req, res )
{
    // console.log('remove');
    await studentModel.delById( req.params.id );
    res.redirect( '../' );
} );

// lecturers
router.get( '/lecturers', auth, async function ( req, res )
{
    // console.log('admin/students');
    const lecturers = await lecturerModel.all();

    for ( let i = 0; i < lecturers.length; ++i )
        lecturers[ i ].l_DOB = moment( lecturers[ i ].l_DOB, 'YYYY-MM-DD' ).format( 'DD/MM/YYYY' );

    res.render( 'vwAdmins/lecturers', {
        lecturers
    } );
} );

router.post( '/lecturers/lock/:id', auth, async function ( req, res )
{
    console.log( req.params.id );
    const lecturer = {
        l_IsActive: '0',
    };
    await lecturerModel.update( lecturer, req.params.id );
    res.redirect( '../' );
} );

router.post( '/lecturers/unlock/:id', auth, async function ( req, res )
{
    // console.log(req.params.id);
    const lecturer = {
        l_IsActive: '1',
    };
    await lecturerModel.update( lecturer, req.params.id );
    res.redirect( '../' );
} );

router.post( '/lecturers/remove/:id', auth, async function ( req, res )
{
    await lecturerModel.delById( req.params.id );
    res.redirect( '../' );
} );

router.post( '/lecturers/add', auth, async function ( req, res )
{
    console.log( 'ADD' );
    const hash = bcrypt.hashSync( req.body.username, 10 );
    const dob = moment( req.body.dob, 'DD/MM/YYYY' ).format( 'YYYY-MM-DD' );
    const user = {
        l_Username: req.body.username,
        l_Password: hash,
        l_DOB: dob,
        l_Name: req.body.name,
        l_Email: req.body.email,
        l_IsActive: '1',
        l_Occupation: '',
        l_Description: '',
        // permission: 0
    };
    await lecturerModel.add( user );
    res.redirect( '/admin/lecturers' );
} );

// categories
router.get( '/categories', auth, function ( req, res )
{
    // console.log('admin/students');
    // const categories = await categoryModel.all();

    res.render( 'vwAdmins/categories', {
        // categories
    } );
} );

router.post( '/categories/edit/:id', auth, async function ( req, res )
{
    // console.log('EDIT');
    const cat = {
        CatName: req.body.CatName,
        CatID: req.params.id,
    };
    const cat1 = await categoryModel.singleByCatName( req.body.CatName );
    if ( cat1 === null )
    {
        await categoryModel.patch( cat );
    }
    res.redirect( '/admin/categories' );
} );

router.get( '/categories/edit/is-available', async function ( req, res )
{
    const CatName = req.query.catname;
    if ( CatName.length === 0 )
        return res.json( false );
    // console.log(CatName);
    const cat = await categoryModel.singleByCatName( CatName );
    if ( cat === null )
    {
        return res.json( true );
    }

    res.json( false );
} );

router.post( '/categories/add/:id', auth, async function ( req, res )
{
    const cat = {
        CatName: req.body.CatName,
        CatParentID: req.params.id,
    };
    const cat1 = await categoryModel.singleByCatName( req.body.CatName );
    if ( cat1 === null )
    {
        await categoryModel.add( cat );
    }
    res.redirect( '/admin/categories' );
} );

router.post( '/categories/addParent', auth, async function ( req, res )
{
    const cat = {
        CatName: req.body.CatName,
        CatParentID: 0,
    };
    const cat1 = await categoryModel.singleByCatName( req.body.CatName );
    if ( cat1 === null )
    {
        await categoryModel.add( cat );
    }
    res.redirect( '/admin/categories' );
} );

router.post( '/categories/delete/:id', auth, async function ( req, res )
{
    let isDelete = true;
    let cat = {
        CatID: +req.params.id,
    };
    let CatID = +req.params.id;
    let childs = await categoryModel.allChild( CatID );

    let courses = await courseModel.getByCatID( 0, 1000, CatID );
    if ( courses.length !== 0 )
        isDelete = false;

    for ( let i = 0; i < childs.length; ++i )
    {
        courses = await courseModel.getByCatID( 0, 1000, childs[ i ].CatID );
        if ( courses.length !== 0 )
            isDelete = false;
    }

    if ( isDelete )
    {
        await categoryModel.del( cat );
        for ( let i = 0; i < childs.length; ++i )
        {
            cat = { CatID: childs[ i ].CatID };
            await categoryModel.del( cat );
        }
    }

    res.redirect( '/admin/categories' );
} );


// courses
router.get( '/courses', auth, async function ( req, res )
{
    const page = +req.query.page || 1;

    const limit = 4;
    const skip = limit * ( page - 1 );

    let CatID = +req.query.CatID || 0;
    if ( CatID === 0 )
        CatID = null;

    let l_Username = req.query.l_Username || '';
    let l_ID = null;
    if ( l_Username !== '' )
    {
        const lecturer = await lecturerModel.singleByUserName( l_Username );
        if ( lecturer !== null )
            l_ID = lecturer.l_ID;
        else
            l_ID = -1;
    }

    let condition = {
        CatID,
        l_ID,
    };

    console.log( "Condition route:" );
    console.log( condition );

    const courses = await courseModel.filterCourses( 0, 1000, condition );
    // const fullCourses = await courseModel.filterCourses(0, 1000, condition);
    console.log( courses );
    if ( CatID === null )
        CatID = 0;
    if ( l_Username === null )
        l_Username = '';
    res.render( 'vwAdmins/courses', {
        courses,
        isEmpty: courses.length === 0,
        // page,
        // maxpage: Math.floor((fullCourses.length-1)/limit) + 1,
        CatID,
        l_Username,
    } );
} );

router.post( '/courses/lock/:id', auth, async function ( req, res )
{
    console.log( req.params.id );
    const c = {
        IsDisable: '1',
    };
    await courseModel.update( c, req.params.id );
    // res.redirect('../');
    res.redirect( req.get( 'referer' ) );
} );

router.post( '/courses/unlock/:id', auth, async function ( req, res )
{
    // console.log('UNLOCK');
    // console.log(req.params.id);
    const c = {
        IsDisable: '0',
    };
    await courseModel.update( c, req.params.id );
    // res.redirect('../');
    res.redirect( req.get( 'referer' ) );
} );

module.exports = router;