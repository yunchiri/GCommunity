const dbservice = require('../services/dbservice')
const ModelError = require('./modelerror.js')
const validation = require('../lib/validation-errors.js');


/**
 * ID로 어플리케이션 마스터 데이터 조회
 */
exports.get = async function(conn, id) {

    const sql =
    `
    select app.id             as id
        ,  app.name           as name
        ,  app.description    as description
        ,  app.use_yn         as use_yn
        ,  app.cancle_date    as cancle_date
        ,  app.updated        as updated
        ,  app.created        as created
    from   app_master app
    where  1=1
    and    app.id = ?
    `
    const [ results ] = await conn.query(sql, [id]);
    const result = results[0];
    
    return result;
}


/**
 * 특정 필드로 어플리케이션 마스터 데이터 조회
 */
exports.getBy = async function(conn, field, value) {
    
    try {
        const sql = 
        `
        select app.id             as id
            ,  app.name           as name
            ,  app.description    as description
            ,  app.use_yn         as use_yn
            ,  app.cancle_date    as cancle_date
            ,  app.updated        as updated
            ,  app.created        as created
        from   app_master app
        where  1=1 
        and    ${field} = :${field} 
        order by id
        `;
        
        const [ results ] = await conn.query(sql, { [field]: value } );
        return results;

    } catch (e) {
        switch (e.code) {
            case 'ER_BAD_FIELD_ERROR': throw new ModelError(403, 'Unrecognised app_master field '+field);
            default: Log.exception('app_master.getBy', e); throw new ModelError(500, e.message);
        }
    }  
}


/**
 * 어플리케이션 마스터 데이터 입력
 */
exports.insert = async function(conn, values) {

    try {
        
        if ( validation.empty(values.name)) {
            throw new ModelError(403, 'app_master.name 컬럼의 값이 없습니다.');
        }
        
        const sql = conn.format('insert into reservation set ?', [ values ]);
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
                console.log('Reservation.insert', e);
                throw new ModelError(500, e.message); // Internal Server Error for uncaught exception
        }
    }
}



/**
 * 어플리케이션 마스터 데이터 삭제
 */
exports.delete = async function(conn, id) {
    try {

        await conn.query('delete from reservation where id = ?', { id });
        return true;

    } catch (e) {
        switch (e.code) {
            case 'ER_ROW_IS_REFERENCED_': // trailing underscore?
            case 'ER_ROW_IS_REFERENCED_2':
                // related record exists in Reservation
                throw new ModelError(403, e.message); // Forbidden
            default:
                Log.exception('Reservation.delete', e);
                throw new ModelError(500, e.message); // Internal Server Error
        }
    }
}