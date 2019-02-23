const ModelError = require('./modelerror.js')
const validation = require('../lib/validation-errors.js');
const dbservice = require('../services/db.service')

/**
 * ID로 사용자 마스터 데이터 조회
 */
exports.get = async function(conn, id) {

    const sql =
    `
    select usr.id             as id      
        ,  usr.name           as name
        ,  usr.app_id         as app_id
        ,  usr.role           as role
        ,  usr.use_yn         as use_yn
        ,  usr.cancle_date    as cancle_date
        ,  usr.updated        as updated
        ,  usr.created        as created
    from   user usr
    where  1=1
    and    usr.id = ?
    `
    const [ results ] = await conn.query(sql, [id]);
    const result = results[0];
    
    return result;
}


/**
 * 소셜로그인 정보로 유저조회
 */
exports.getSocialLoginInfo = async function(provider, provider_uid) {

    const sql =
    `
    select usr.id             as id
    from   user usr
    where  1=1
    and    usr.provider = ?
    and    usr.provider_uid = ?
    `

    try{
        const [ results ] = await dbservice.pool().query(sql, [provider, provider_uid]);
        const result = results[0];

        return result;
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
                throw new ModelError(500, e.message); // Internal Server Error for uncaught exception
        }
    }
}

/**
 * 특정 필드로 사용자 마스터 데이터 조회
 */
exports.getBy = async function(conn, field, value) {
    
    try {
        const sql = 
        `
        select usr.id             as id      
            ,  usr.name           as name
            ,  usr.app_id         as app_id
            ,  usr.role           as role
            ,  usr.use_yn         as use_yn
            ,  usr.cancle_date    as cancle_date
            ,  usr.updated        as updated
            ,  usr.created        as created
        from   user usr
        where  1=1 
        and    ${field} = :${field} 
        order by id
        `;
        
        const [ results ] = await conn.query(sql, { [field]: value } );
        
        return results;

    } catch (e) {
        switch (e.code) {
            case 'ER_BAD_FIELD_ERROR': throw new ModelError(403, 'Unrecognised user field '+field);
            default: Log.exception('user.getBy', e); throw new ModelError(500, e.message);
        }
    }  
}


/**
 * 사용자 마스터 데이터 입력
 */
exports.insert = async function(conn, values) {

    try {
        
        if ( validation.empty(values.name)) {
            throw new ModelError(403, 'user.name 컬럼의 값이 없습니다.');
        }

        if ( validation.empty(values.appId)) {
            throw new ModelError(403, 'user.app_id 컬럼의 값이 없습니다.');
        }

        const sql = conn.format('insert into user set ?', [ values ]);
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
                console.log('user.insert', e);
                throw new ModelError(500, e.message); // Internal Server Error for uncaught exception
        }
    }
}



/**
 * 사용자 마스터 데이터 삭제
 */
exports.delete = async function(conn, id) {
    try {

        await conn.query('delete from user where id = ?', { id });
        return true;

    } catch (e) {
        switch (e.code) {
            case 'ER_ROW_IS_REFERENCED_': // trailing underscore?
            case 'ER_ROW_IS_REFERENCED_2':
                throw new ModelError(403, e.message); // Forbidden
            default:
                Log.exception('user.delete', e);
                throw new ModelError(500, e.message); // Internal Server Error
        }
    }
}