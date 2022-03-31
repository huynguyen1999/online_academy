const db = require( '../utils/db' );
const moment = require( 'moment' );
const TBL = 'admins',
    TBL_ONCOURSE = 'onCourse',
    TBL_COURSES = 'courses';
//l stands for lecturer
module.exports = {
    all ()
    {
        return db.load( `select * from ${ TBL }` );
    },
    async single ( a_ID )
    {
        const rows = await db.load( `select * from ${ TBL } where a_ID = ${ a_ID }` );
        if ( rows.length === 0 ) return null;
        return rows[ 0 ];
    },

    async singleByUserName(username) {
        const rows = await db.load(`select * from ${TBL} where a_Username = '${username}'`);
        if (rows.length === 0)
          return null;
    
        return rows[0];
      },
    
      async singleByEmail(email) {
        const rows = await db.load(`select * from ${TBL} where a_Email = '${email}'`);
        if (rows.length === 0)
          return null;
    
        return rows[0];
      },
    
      add(entity) {
        return db.add(entity, TBL)
      },
    
      update(entity, id) {
        const condition = { a_ID: id };
        delete entity.a_ID;
        return db.patch(entity, condition, TBL);
      },
};