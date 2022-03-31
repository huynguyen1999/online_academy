const db = require( '../utils/db' );
const TBL_CATEGORIES = 'categories';

module.exports = {
  all ()
  {
    return db.load( `select * from ${ TBL_CATEGORIES }` );
  },

  allChild ( id )
  {
    const sql = `
      select *
      from categories c
      where c.CatParentID = ${ id }
    `;
    return db.load( sql );
  },
  //huy's
  add ( entity )
  {
    return db.add( entity, TBL_CATEGORIES );
  },
  // async single ( id )
  // {
  //   const rows = await db.load( `select * from ${ TBL_CATEGORIES } where CatID = ${ id }` );
  //   if ( rows.length === 0 )
  //     return null;

  //   return rows[ 0 ];
  // },
  async singleByCatName ( CatName )
  {
    const rows = await db.load( `select * from ${ TBL_CATEGORIES } where CatName = '${ CatName }'` );
    if ( rows.length === 0 )
      return null;

    return rows[ 0 ];
  },
  del ( entity )
  {
    const condition = { CatID: entity.CatID };
    return db.del( condition, TBL_CATEGORIES );
  },
  patch ( data )
  {
    const condition = { CatID: data.CatID },
      entity = { CatName: data.CatName };
    return db.patch( data, condition, TBL_CATEGORIES );
  },

  async single ( CatID )
  {
    const rows = await db.load( `select * from ${ TBL_CATEGORIES } where CatID = ${ CatID }` );
    if ( rows.length === 0 ) return null;
    return rows[ 0 ];
  },

  async hotCat ()
  {
    sql = `
    select t2.CatName, t2.CatID, sum(t1.NumSell) as sum
    from
    (SELECT e.CourseID, count(e.EnrollID) as NumSell FROM enrolls e where e.EnrollDate > NOW() - INTERVAL 4 WEEK group by e.CourseID) as t1
    inner join
    (select c_.CourseID, cat_.CatID, cat_.CatName
    from courses c_ left join ${ TBL_CATEGORIES } cat_ on c_.CatID = cat_.CatID) as t2
    on t1.CourseID = t2.CourseID
    group by CatID
    order by sum desc
    limit 5
    `;
    return db.load( sql );
  }
};
