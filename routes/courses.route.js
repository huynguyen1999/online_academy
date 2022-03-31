const express = require( 'express' );
const courseModel = require( '../models/course.model' );
const categoryModel = require( '../models/category.model' );
const router = express.Router();

router.get( '/byCat/:id', async function ( req, res )
{
    const catID = req.params.id;
    const page = +req.query.page || 1;

    const limit = 4;
    const skip = limit * ( page - 1 );

    const courses = await courseModel.getByCatID( skip, limit, catID );
    const fullCourses = await courseModel.getByCatID( 0, 1000, catID );
    const cat = await categoryModel.single( catID );
    res.render( 'vwCourses/byCat', {
        cat,
        courses,
        isEmpty: courses.length === 0,
        page,
        maxpage: Math.floor( ( fullCourses.length - 1 ) / limit ) + 1,
    } );
} );

router.get( '/search', async function ( req, res )
{
    const query = req.query.query;
    const page = +req.query.page || 1;
    const option = +req.query.option || 0;

    const limit = 4;
    const skip = limit * ( page - 1 );

    console.log( query );


    const courses = await courseModel.fulltextsearch( query, skip, limit, option );
    const fullCourses = await courseModel.fulltextsearch( query, 0, 1000, 0 );
    console.log( courses );
    res.render( 'vwCourses/search', {
        courses,
        isEmpty: courses.length === 0,
        page,
        maxpage: Math.floor( ( fullCourses.length - 1 ) / limit ) + 1,
        query,
        option,
    } );
} );

module.exports = router;