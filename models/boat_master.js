const dbservice = require('../services/dbservice')
const ModelError = require('./modelerror.js')
const validation = require('../lib/validation-errors.js');
var SqlString = require('sqlstring');


/**
 * ID로 배 마스터 데이터 조회
 */
exports.get = async function(conn, id) {

    const sql =
    `
    select boat.id             as id      
        ,  boat.name           as name
        ,  boat.app_id         as app_id
        ,  boat.type           as type
        ,  boat.captain_id     as captain_id
        ,  boat.capacity       as capacity
        ,  boat.fish_type      as fish_type
        ,  boat.from_time      as from_time
        ,  boat.to_time        as to_time
        ,  boat.info           as info
        ,  boat.use_yn         as use_yn
        ,  boat.cancle_date    as cancle_date
        ,  boat.updated        as updated
        ,  boat.created        as created
    from   boat_master boat
    where  1=1
    and    boat.id = ?
    `
    const [ results ] = await conn.query(sql, [id]);
    const result = results[0];
    
    return result;
}


/**
 * 특정 필드로 배 마스터 데이터 조회
 */
exports.getBy = async function(conn, field, value) {
    
    try {
        const sql = 
        `
        select boat.id             as id      
            ,  boat.name           as name
            ,  boat.app_id         as app_id
            ,  boat.type           as type
            ,  boat.captain_id     as captain_id
            ,  boat.capacity       as capacity
            ,  boat.fish_type      as fish_type
            ,  boat.from_time      as from_time
            ,  boat.to_time        as to_time
            ,  boat.info           as info
            ,  boat.use_yn         as use_yn
            ,  boat.cancle_date    as cancle_date
            ,  boat.updated        as updated
            ,  boat.created        as created
        from   boat_master boat
        where  1=1 
        and    ${field} = :${field} 
        order by id
        `;
        
        const [ results ] = await conn.query(sql, { [field]: value } );
        
        return results;

    } catch (e) {
        switch (e.code) {
            case 'ER_BAD_FIELD_ERROR': throw new ModelError(403, 'Unrecognised boat_master field '+field);
            default: Log.exception('boat_master boat.getBy', e); throw new ModelError(500, e.message);
        }
    }  
}


/**
 * 배 마스터 데이터 입력
 */
exports.insert = async function(conn, values) {

    try {

        if ( validation.empty(values.app_id)) {
            throw new ModelError(403, 'boat_master.app_id 컬럼의 값이 없습니다.');
        }

        if ( validation.empty(values.name)) {
            throw new ModelError(403, 'boat_master.name 컬럼의 값이 없습니다.');
        }

        if ( validation.empty(values.capacity)) {
            throw new ModelError(403, 'boat_master.capacity 컬럼의 값이 없습니다.');
        }

        if ( validation.empty(values.capacity)) {
            throw new ModelError(403, 'boat_master.capacity 컬럼의 값이 없습니다.');
        }

        if ( validation.empty(values.use_yn)) {
            values.use_yn = 'Y'
        }

        if ( !validation.empty(values.fish_type)) {
            values.fish_type = JSON.stringify(values.fish_type);
        }

        values.updated = SqlString.raw('NOW()');
        values.created = SqlString.raw('NOW()');

        const sql = conn.format('insert into boat_master set ?', [ values ]);
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
                console.log('boat_master.insert', e);
                throw new ModelError(500, e.message); // Internal Server Error for uncaught exception
        }
    }
}



/**
 * 배 마스터 데이터 삭제
 */
exports.delete = async function(conn, id) {
    try {

        await conn.query('delete from boat_master where id = ?', { id });
        return true;

    } catch (e) {
        switch (e.code) {
            case 'ER_ROW_IS_REFERENCED_': // trailing underscore?
            case 'ER_ROW_IS_REFERENCED_2':
                throw new ModelError(403, e.message); // Forbidden
            default:
                Log.exception('boat_master.delete', e);
                throw new ModelError(500, e.message); // Internal Server Error
        }
    }
}