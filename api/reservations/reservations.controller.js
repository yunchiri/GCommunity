const dbservice = require('../../services/dbservice');
const validation = require('../../lib/validation-errors.js');

const Reservation = require('../../models/reservation.js');
var SqlString = require('sqlstring');

/**
 * 예약 내역 조회
 */
exports.getReservationList = async (ctx) => {

    const appid = ctx.query.appid
    if ( validation.empty(appid)) {
        throw new ModelError(403, '앱 아이디가 누락되었습니다.');
    }

    const sql =
    `
    select *
    from   reservation rsv
    where  1=1
    and    rsv.use_yn = 'Y'
    #----------------------------------
    and    rsv.app_id = ?
    #----------------------------------
    ;    
    `

    let [rows, fields] = await dbservice.pool().query(sql, [appid]);
    
    ctx.body = rows
};



/**
 * 아이디로 예약 내역 조회
 */
exports.getReservationById = async (ctx) => {

    const id = ctx.params.id;

    const app_id = ctx.query.app_id
    if ( validation.empty(app_id)) {
        throw new ModelError(403, '앱 아이디가 누락되었습니다.');
    }

    const sql =
    `
    select *
    from   reservation rsv
    where  1=1
    and    rsv.use_yn = 'Y'
    #----------------------------------
    and    rsv.app_id = ?
    and    rsv.id     = ?
    #----------------------------------
    ;    
    `

    let [rows, fields] = await dbservice.pool().query(sql, [app_id, id]);
    if (!rows) ctx.throw(404, `No schedule ${ctx.params.id} found`); // Not Found

    ctx.response.body = rows[0];
};



/**
 * 예약 등록
 * {
    "type": 1,
    "price": 140000,
    "app_id": 1,
    "status": 2,
    "remarks": null,
    "user_id": 4,
    "capacity": 1,
    "bank_type": null,
    "depositor": "김영칠",
    "schedule_id": 1,
    "request_remarks": null
   } 
 */
exports.postReservation = async (ctx) => {

    const values = ctx.request.body;
    const id = await Reservation.insert(dbservice.pool(), values);

    const reservation = await Reservation.get(dbservice.pool(), id);
    if (!reservation) 
        ctx.throw(404, `No reservation ${ctx.params.id} found`); // Not Found

    ctx.response.body = reservation;
    ctx.response.status = 201; // Created
}


/**
 * 예약 수정
 */
exports.patchReservation = async (ctx) => {

    const id = ctx.params.id;
    const values = ctx.request.body;

    // if ( validation.empty(values.app_id)) {
    //     throw new ModelError(403, '앱 아이디가 누락되었습니다.');
    // }

    await Reservation.update(dbservice.pool(), id, values);

    const reservation = await Reservation.get(dbservice.pool(), id);
    if (!reservation) ctx.throw(404, `No reservation ${ctx.params.id} found`); // Not Found

    ctx.response.body = reservation;
}


/**
 * 예약 추소
 */
exports.cancleReservation = async (ctx) => {

    const id = ctx.params.id;
    const values = ctx.request.body;

    let rows = await Reservation.get(dbservice.pool(), id)

    if ( validation.empty(rows)) {
        ctx.throw(404, `No reservation ${ctx.params.id} found`); // Not Found
    }

    if ( rows.use_yn == "N") {
        ctx.throw(404, `${ctx.params.id} 예약건은 이미 취소처리 되었습니다.`); // Not Found
    }

    await Reservation.update(dbservice.pool(), id, values);

    const reservation = await Reservation.get(dbservice.pool(), id);
    if (!reservation) ctx.throw(404, `No reservation ${ctx.params.id} found`); // Not Found

    ctx.response.body = reservation;
}



/**
 * 예약 삭제
 */
exports.deleteReservation = async (ctx) => {

    const id = ctx.params.id;
    await BoatMaster.delete(dbservice.pool(), id);

    const schedule = await BoatMaster.get(dbservice.pool(), id);
    if (!schedule) ctx.throw(404, `No boat_master ${ctx.params.id} found`); // Not Found

    ctx.response.body = schedule;
}