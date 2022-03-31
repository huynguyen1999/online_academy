const db = require( '../utils/db' );
const moment = require( 'moment' );
const TBL = 'students',
	TBL_COURSES = 'courses',
	TBL_ENROLLS = 'enrolls',
	TBL_CHAPTERS = 'chapters',
	TBL_ONCOURSE = 'oncourse',
	TBL_ENROLL_DETAILS = 'enrolldetails',
	TBL_CATEGORIES = 'categories',
	TBL_LECTURERS = 'lecturers',
	TBL_WATCHLIST = 'watchlist';

module.exports = {
	all ()
	{
		return db.load( `select * from ${ TBL }` );
	},

	async single ( id )
	{
		const rows = await db.load( `select * from ${ TBL } where s_ID = ${ id }` );
		if ( rows.length === 0 )
			return null;

		return rows[ 0 ];
	},

	async singleByUserName ( username )
	{
		const rows = await db.load( `select * from ${ TBL } where s_Username = '${ username }'` );
		if ( rows.length === 0 )
			return null;

		return rows[ 0 ];
	},

	async singleByEmail ( email )
	{
		const rows = await db.load( `select * from ${ TBL } where s_Email = '${ email }'` );
		if ( rows.length === 0 )
			return null;

		return rows[ 0 ];
	},

	add ( entity )
	{
		return db.add( entity, TBL );
	},

	update ( entity, id )
	{
		const condition = { s_ID: id };
		delete entity.s_ID;
		return db.patch( entity, condition, TBL );
	},

	async delById ( id )
	{
		const condition = { s_ID: id };
		return db.del( condition, TBL );
	},

	async getFavorite ( s_ID, CourseID )
	{
		const sql = `select * from ${ TBL_WATCHLIST } where s_ID = ${ s_ID } and CourseID=${ CourseID }`;
		const ret = await db.load( sql );
		if ( ret.length === 0 ) return null;
		return ret[ 0 ];
	}
	,
	addIntoWatchlist ( data )
	{
		const entity = {
			CourseID: data.CourseID,
			s_ID: data.s_ID
		};
		return db.add( entity, TBL_WATCHLIST );
	},
	removeFromWatchlist ( data )
	{
		const condition = {
			wl_ID: data.wl_ID
		};
		return db.del( condition, TBL_WATCHLIST );
	},
	async addCourse ( CourseID, s_ID )
	{
		const entity = {
			EnrollDate: moment().format( "YYYY-MM-DD" ),
			s_ID,
			CourseID,
		};
		//console.log( entity );
		await db.add( entity, TBL_ENROLLS );
	},
	async addReview ( data )
	{
		const entity = {
			Rate: data.star || null,
			Comment: data.comment || null,
		};
		const condition = {
			EnrollID: data.enrollid
		};
		await db.patch( entity, condition, TBL_ENROLLS );
	},
	async isFavorite ( s_ID, CourseID )
	{
		const sql = `select * 
					from ${ TBL_WATCHLIST } 
				where 
					s_ID=${ s_ID } and CourseID= ${ CourseID }`;
		const ret = await db.load( sql );
		//console.log( ret );
		if ( ret.length === 0 ) return false;
		return true;
	},
	async getEnroll ( s_ID, CourseID )
	{
		const sql = `select e.*, c.CourseName 
					from ${ TBL_ENROLLS } e left join ${ TBL_COURSES } c on e.CourseID=c.CourseID
					where e.s_ID = ${ s_ID } and e.CourseID=${ CourseID }`;
		const ret = await db.load( sql );
		if ( ret.length === 0 ) return null;
		return ret[ 0 ];
	},
	getStudentCourses ( s_ID )
	{
		const sql = `
				select 
					distinct(table1.CourseID), table1.CatID, table1.CourseName, table1.TinyDes, table1.TotalStudents,
					table1.Active, table1.NumberSeen,DATE_FORMAT(table1.LastUpdate,'%m/%d/%Y') as LastUpdate,
					table1.NumRate,table1.Rate, en.s_ID,
					(select wl.wl_ID 
					from watchlist wl 
					where wl.s_ID = en.s_ID and wl.CourseID=en.CourseID) as wl_ID
				from 
					(select c.*, count(enrolls.EnrollID) as TotalStudents, count(enrolls.Rate) as NumRate,  ROUND( AVG(enrolls.Rate),2 ) as Rate
					from courses c left join enrolls on c.CourseID = enrolls.CourseID
					group by c.CourseID) as table1
				left join
					enrolls en
					on table1.CourseID = en.CourseID
				where 
					en.s_ID=${ s_ID }`;
		return db.load( sql );
	},
	getStudentWatchlist ( s_ID )
	{
		const sql = `
			select 
				distinct(table1.CourseID), table1.CatID, table1.CourseName, table1.TinyDes, table1.TotalStudents,
				table1.Active, table1.NumberSeen,DATE_FORMAT(table1.LastUpdate,'%m/%d/%Y') as LastUpdate,
				table1.NumRate,table1.Rate, en.s_ID, wl.wl_ID
			from 
				(select c.*, count(enrolls.EnrollID) as TotalStudents, count(enrolls.Rate) as NumRate,  ROUND( AVG(enrolls.Rate),2 ) as Rate
				from courses c join enrolls on c.CourseID = enrolls.CourseID
				group by c.CourseID) as table1
			join
				enrolls en
				on table1.CourseID = en.CourseID
			join 
				watchlist wl 
				on wl.s_ID = en.s_ID and wl.CourseID = en.CourseID
			where 
				en.s_ID=${ s_ID }`;
		return db.load( sql );
	},
	async addEnrollDetails ( Chapters, s_ID )
	{

		for ( const chapter of Chapters )
		{
			const entity = {
				s_ID,
				ChapterID: chapter.ChapterID,
				Time: chapter.Time,
				Done: chapter.Done
			};
			console.log( chapter.EnrollDetails_ID );
			//nếu chapter có EnrollDetails là null thì +
			if ( chapter.EnrollDetails_ID === '' )
			{
				console.log( 'null' );
				await db.add( entity, TBL_ENROLL_DETAILS );
			}
			else
			{
				const condition = {
					ID: chapter.EnrollDetails_ID
				};
				await db.patch( entity, condition, TBL_ENROLL_DETAILS );
			}
		}
	}
};
