const dbservice = require('../services/dbservice')


exports.get = async function(conn, id) {
    try {
        const [ testMasters, ff ] 
            = await conn.query('Select * From test_master Where id = ?', [id]);
        const testMaster = testMasters[0];
        return testMaster;

    } catch (e) {
        switch (e.code) { // just use default MySQL messages for now
            case 'ER_BAD_NULL_ERROR':
            case 'ER_NO_REFERENCED_ROW_2':
            case 'ER_NO_DEFAULT_FOR_FIELD':
                throw new ModelError(403, e.message); // Forbidden
            case 'ER_DUP_ENTRY':
                throw new ModelError(409, e.message); // Conflict
            case 'ER_BAD_FIELD_ERROR':
                throw new ModelError(500, e.message); // Internal Server Error for programming errors
            default:
                //Log.exception('test_master.insert', e);
                console.error('test_master.insert', e);
                throw new ModelError(500, e.message); // Internal Server Error for uncaught exception
        }
    }
}

exports.insert = async function(conn, values) {
    try {

        //var p = JSON.stringify(values);
        //var p = JSON.stringify(values);
        //var pp = JSON.parse(p);
        console.log(util.inspect(values, false, null));
        values.col3 = JSON.stringify(values.col3)
        console.log('----------------------------------');
        console.log(values);
        console.log('----------------------------------');
        const sql = conn.format('insert into schedule set ?', [ values ]);
        console.log(sql);

        const [ result ] 
        = await conn.query(`insert into test_master set ?`, [values]);

        return result.insertId;
    } catch (e) {
        switch (e.code) { // just use default MySQL messages for now
            case 'ER_BAD_NULL_ERROR':
            case 'ER_NO_REFERENCED_ROW_2':
            case 'ER_NO_DEFAULT_FOR_FIELD':
                throw new ModelError(403, e.message); // Forbidden
            case 'ER_DUP_ENTRY':
                throw new ModelError(409, e.message); // Conflict
            case 'ER_BAD_FIELD_ERROR':
                throw new ModelError(500, e.message); // Internal Server Error for programming errors
            default:
                //Log.exception('test_master.insert', e);
                console.error('test_master.insert', e);
                throw new ModelError(500, e.message); // Internal Server Error for uncaught exception
        }
    }
}

// class TestMaster
// {
//     static async get(id) {
//         const [ testMasters ] 
//             = await dbservice.pool().query('Select * From test_master Where col1 = :id', { id });
//         return testMasters[0];
//     }

//     static async insert(values) {
        
//         try {
//             const [ result ] 
//             = await dbservice.pool().query(`insert into test_master set ?`, [testParams]);
    
//             return result.insertId;
//         } catch (e) {
//             switch (e.code) { // just use default MySQL messages for now
//                 case 'ER_BAD_NULL_ERROR':
//                 case 'ER_NO_REFERENCED_ROW_2':
//                 case 'ER_NO_DEFAULT_FOR_FIELD':
//                     throw new ModelError(403, e.message); // Forbidden
//                 case 'ER_DUP_ENTRY':
//                     throw new ModelError(409, e.message); // Conflict
//                 case 'ER_BAD_FIELD_ERROR':
//                     throw new ModelError(500, e.message); // Internal Server Error for programming errors
//                 default:
//                     Log.exception('test_master.insert', e);
//                     throw new ModelError(500, e.message); // Internal Server Error for uncaught exception
//             }
//         }
        
//     }
// }
