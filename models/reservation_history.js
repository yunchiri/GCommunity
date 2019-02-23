const dbservice = require('../services/dbservice')
const ModelError = require('./modelerror.js')
const validation = require('../lib/validation-errors.js');

/**
 * ID로 예약 히스토리 데이터 조회
 */
exports.get = async function(conn, id) {
    const [ reservations ] = await conn.query('select * from reservation_history where id = ?', [id]);
    const reservation = reservations[0];
    return reservation;
}


/**
 * 특정 필드로 예약 히스토리 데이터 조회
 */
exports.getBy = async function(conn, field, value) {
    
    try {
        const sql = `select * from reservation_history where 1=1 and ${field} = :${field} order by id`;
        
        const [ reservations ] = await conn.query(sql, { [field]: value } );
        return reservations;

    } catch (e) {
        switch (e.code) {
            case 'ER_BAD_FIELD_ERROR': throw new ModelError(403, 'Unrecognised reservation_history field '+field);
            default: Log.exception('reservation_history.getBy', e); throw new ModelError(500, e.message);
        }
    }  
}


/**
 * 예약 히스토리 데이터 입력
 */
exports.insert = async function(conn, values) {

    try {

        if ( validation.empty(values.id)) {
            throw new ModelError(403, 'id 값이 없습니다.');
        }

        if ( validation.empty(values.crud)) {
            throw new ModelError(403, 'crud 값이 없습니다.');
        }

        if ( validation.empty(values.work_id)) {
            throw new ModelError(403, 'work_id 값이 없습니다.');
        }

        const sql =
        `
        insert into reservation_history
        (      reservation_id
            ,  seq
            ,  crud
            ,  app_id
            ,  schedule_id
            ,  user_id
            ,  type
            ,  capacity
            ,  price
            ,  status
            ,  depositor
            ,  bank_type
            ,  request_remarks
            ,  remarks
            ,  use_yn
            ,  cancle_code
            ,  cancle_reason
            ,  cancle_date
            ,  work_id
            ,  created )
        select rsv.id as reservation_id
            ,  ifnull((select max(x.seq) 
                       from   reservation_history x 
                       where  x.reservation_id = ${values.id}), 0) + 1 as seq
            ,  ? as crud
            ,  rsv.app_id
            ,  rsv.schedule_id
            ,  rsv.user_id
            ,  rsv.type
            ,  rsv.capacity
            ,  rsv.price
            ,  rsv.status
            ,  rsv.depositor
            ,  rsv.bank_type
            ,  rsv.request_remarks
            ,  rsv.remarks
            ,  rsv.use_yn
            ,  rsv.cancle_code
            ,  rsv.cancle_reason
            ,  rsv.cancle_date
            ,  ? as work_id
            ,  now() as created
        from   reservation rsv
        where  1=1
        and    rsv.id = ?
        ;
        `
        
        const [result] = await conn.query(sql, [values.crud, values.work_id, values.id]);
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
 * 예약 히스토리 데이터 삭제
 */
exports.delete = async function(conn, id) {
    try {

        await conn.query('delete from reservation_history where id = ?', { id });
        return true;

    } catch (e) {
        switch (e.code) {
            case 'ER_ROW_IS_REFERENCED_': // trailing underscore?
            case 'ER_ROW_IS_REFERENCED_2':
                // related record exists in Reservation
                throw new ModelError(403, 'reservation_history belongs to team(s)'); // Forbidden
            default:
                Log.exception('reservation_history.delete', e);
                throw new ModelError(500, e.message); // Internal Server Error
        }
    }
}