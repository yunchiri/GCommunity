//import TestMaster from '../../models/test-master';
const dbservice = require('../../services/dbservice')
const TestMaster = require('../../models/test-master')
const TestMaster2 = require('../../models/test-master2')
const path = require('path');



///
/// 앱마스터 정보를 아이디로 조회
///
exports.testById = async(ctx) => {
    const id = ctx.params.id;

    let [rows, fields] = await dbservice.pool().query(
        `select *
         from   test_master t
         where  t.col1 = ${id}
         limit 1;
         `);
    
    ctx.body = rows
}


exports.postTest = async(ctx) => {
  
    /*
    const testParams = ctx.request.body;

    // const [ result ] 
    //     = await dbservice.pool().query(`insert into test_master set ?`, [testParams]);

    const id = await TestMaster.insert(ctx.request.body);
    console.log('====================');
    console.log('id', id);
    console.log('====================');

    const row = await TestMaster.get(id); // return created team details
    
    ctx.body = row;
    //ctx.response.body = await TestMaster.get(id); // return created team details
    //ctx.response.body.root = 'TestMaster';
    //ctx.response.set('Location', '/teams/'+id);
    //ctx.response.status = 201; // Created
*/

//trasaction test

    const conn = await dbservice.pool().getConnection();
    try{
        await conn.beginTransaction();
        const id = await TestMaster2.insert(conn, ctx.request.body);
        console.log('====================');
        console.log('id', id);
        console.log('====================');
    
        const row = await TestMaster2.get(conn, id);
    
        console.log('====================');
        console.log('row', row);
        console.log('====================');
    
        await conn.commit();
    }catch{
        await conn.rollback();
    }

    // transaction


}