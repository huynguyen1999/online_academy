const db = require( '../utils/db' );
const moment = require( 'moment' );
const TBL_LECTURERS = 'lecturers',
	TBL_ONCOURSE = 'onCourse',
	TBL = 'lecturers',
	TBL_COURSES = 'courses';
//l stands for lecturer
module.exports = {
	all ()
	{
		return db.load( `select * from ${ TBL_LECTURERS }` );
	},
	async single ( l_ID )
	{
		const rows = await db.load( `select * from ${ TBL_LECTURERS } where l_ID = ${ l_ID }` );
		if ( rows.length === 0 ) return null;
		return rows[ 0 ];
	},
	getCoursesOfLecturer ( l_ID )
	{
		const sql = `select c.*
                    from lecturers lec left join oncourse onc on lec.l_ID = onc.l_ID 
                     join courses c on onc.CourseID = c.CourseID
                    where lec.l_ID = ${ l_ID }`;
		return db.load( sql );
	},
	editProfileOfLecturer ( data )
	{
		const condition = { l_ID: data.id };
		const entity = {
			l_Name: data.name,
			l_Email: data.email,
			l_DOB: moment( data.dob ).format( "YYYY/MM/DD" ),
			l_Occupation: data.occupation,
			l_Description: data.description
		};
		return db.patch( entity, condition, TBL_LECTURERS );
	},
	async singleWithDetail ( l_ID )
	{
		const sql = `select table1.*, count(en.s_ID) as TotalStudents
                from (select lec.l_ID,lec.l_Name, lec.l_Occupation, lec.l_Email, lec.l_DOB,lec.l_Description, count(onc.CourseID) as TotalCourses
                        from lecturers lec join oncourse onc on lec.l_ID=onc.l_ID
                        group by lec.l_ID) as table1
                left join  oncourse onc on table1.l_ID = onc.l_ID left join enrolls en on onc.CourseID= en.CourseID
                where table1.l_ID=${ l_ID }
                group by table1.l_ID`;
		const ret = await db.load( sql );
		if ( ret.length === 0 ) return null;
		ret[ 0 ].l_DOB = moment( ret[ 0 ].l_DOB ).format( 'MM/DD/YYYY' );
		return ret[ 0 ];
	},

  async singleByUserName(username) {
    const rows = await db.load(`select * from ${TBL} where l_Username = '${username}'`);
    if (rows.length === 0)
      return null;

    return rows[0];
  },

  async singleByEmail(email) {
    const rows = await db.load(`select * from ${TBL} where l_Email = '${email}'`);
    if (rows.length === 0)
      return null;

    return rows[0];
  },

  add(entity) {
    return db.add(entity, TBL)
  },

  update(entity, id) {
    const condition = { l_ID: id };
    delete entity.l_ID;
    return db.patch(entity, condition, TBL);
  },

  async delById(id) {
    const condition = {l_ID: id};
    return db.del(condition, TBL);
  }
};