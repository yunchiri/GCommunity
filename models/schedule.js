const dbservice = require('../services/dbservice')
const ModelError = require('./modelerror.js')


/**
 * ID로 일정 데이터 조회
 */
exports.get = async function(conn, id) {

    const [ schedules] = await conn.query('select * from schedule where id = ?', [id]);
    const schedule = schedules[0];
    return schedule;
}


/**
 * 특정 필드로 데이터 조회
 */
exports.getBy = async function(conn, field, value) {
    
    try {
        const sql = `select * from schedule where 1=1 and ${field} = :${field} order by yyyymmdd`;
        
        const [ schedules ] = await conn.query(sql, { [field]: value } );
        return schedules;

    } catch (e) {
        switch (e.code) {
            case 'ER_BAD_FIELD_ERROR': throw new ModelError(403, 'Unrecognised Schedule field '+field);
            default: Log.exception('Member.getBy', e); throw new ModelError(500, e.message);
        }
    }  
}


/**
 * 일정 데이터 입력
 */
exports.insert = async function(conn, values) {

    try {
        
        // 값이 Json인 경우 아래 로직이 필요함. ( 다른방법이 없을까? )
        if ( values.fish_type) {
            values.fish_type = JSON.stringify(values.fish_type);
        }
        
        const sql = conn.format('insert into schedule set ?', [ values ]);
        //console.log(sql);
        const [result] = await conn.query(sql);

        return result.insertId;
    } catch(e) {
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
                //Log.exception('Member.insert', e);
                console.log('Schedule.insert', e);
                throw new ModelError(500, e.message); // Internal Server Error for uncaught exception
        }
    }
}


/**
 * 일정 취소
 */
exports.update = async function(conn, id, values) {

    try {
        
        const sql = conn.format(
            `update schedule 
             set    ?
             where id = ?
            `, [ values, id ]);
        console.log('==============>', sql);
        const result = await conn.query(sql);

        console.log(result);

        return result;

    } catch (e) {
        switch (e.code) { // just use default MySQL messages for now
            case 'ER_BAD_NULL_ERROR':
            case 'ER_DUP_ENTRY':
            case 'ER_ROW_IS_REFERENCED_2':
            case 'ER_NO_REFERENCED_ROW_2':
                throw new ModelError(403, e.message); // Forbidden
            case 'ER_BAD_FIELD_ERROR':
                throw new ModelError(500, e.message); // Internal Server Error for programming errors
            default:
                //Log.exception('Schedule.cancle', e);
                throw new ModelError(500, e.message); // Internal Server Error for uncaught exception
        }
    }
}


/**
 * 일정 취소
 */
exports.cancle = async function(conn, id) {

    try {
        
        const sql = conn.format(
            `update schedule 
             set    use_yn      = "N"
                 ,  cancle_date = now() 
                 ,  updated     = now()
             where id = ?
             and   use_yn = "Y"
            `, [ id ]);
        console.log(sql);
        const result = await conn.query(sql);

        console.log(result);

        return result;

    } catch (e) {
        switch (e.code) { // just use default MySQL messages for now
            case 'ER_BAD_NULL_ERROR':
            case 'ER_DUP_ENTRY':
            case 'ER_ROW_IS_REFERENCED_2':
            case 'ER_NO_REFERENCED_ROW_2':
                throw new ModelError(403, e.message); // Forbidden
            case 'ER_BAD_FIELD_ERROR':
                throw new ModelError(500, e.message); // Internal Server Error for programming errors
            default:
                //Log.exception('Schedule.cancle', e);
                throw new ModelError(500, e.message); // Internal Server Error for uncaught exception
        }
    }
}


/**
 * 데이터 삭제
 */
exports.delete = async function(conn, id) {
    try {

        await conn.query('delete from schedule where id = ?', { id });
        return true;

    } catch (e) {
        switch (e.code) {
            case 'ER_ROW_IS_REFERENCED_': // trailing underscore?
            case 'ER_ROW_IS_REFERENCED_2':
                // related record exists in TeamMember
                throw new ModelError(403, 'Schedule belongs to team(s)'); // Forbidden
            default:
                Log.exception('Schedule.delete', e);
                throw new ModelError(500, e.message); // Internal Server Error
        }
    }
}