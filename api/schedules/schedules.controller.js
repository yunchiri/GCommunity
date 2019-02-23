const dbservice = require('../../services/dbservice');
const path = require('path');
const validation = require('../../lib/validation-errors.js');

const Schedule = require('../../models/Schedule');
var SqlString = require('sqlstring');

///
/// 일정 조회
///
exports.scheduleList = async (ctx) => {

    // let appid = ctx.params.appid
    let appid = ctx.query.appid
    if ( validation.empty(appid)) {
        throw new ModelError(403, '앱 아이디가 누락되었습니다.');
    }
    // 시작일자
    let fromdate = ctx.query.fromdate
    if ( validation.empty(fromdate)) {
        var now = new Date();
        fromdate = now.toISOString().slice(0,10).replace(/-/g,"");
        console.log(`fromdate : ${fromdate}`);
    }
    // 종료일자
    let todate = ctx.query.todate
    if ( validation.empty(todate)) {
        var now = new Date();
        now.setDate(now.getDate() + 14);
        todate = now.toISOString().slice(0,10).replace(/-/g,"");
        console.log(`todate : ${todate}`);
    }

    if ( fromdate > todate) {
        throw new ModelError(403, '시작일자가 종료일자보다 클수없습니다.');
        return;
    }

    let [rows, fields] = await dbservice.pool().query(
        `
        select sche.yyyymmdd
            ,  sche.name
            ,  sche.from_time
            ,  sche.to_time
            ,  boat.id boat_id
            ,  boat.name boat_name
            ,  JSON_OBJECT('id', boat.id
                        ,  'name', boat.name
                        ,  'app_id', boat.app_id
                        ,  'type', boat.type
                        ,  'captain_id', boat.captain_id
                        ,  'capacity', boat.capacity
                        ,  'from_time', boat.from_time
                        ,  'to_time', boat.to_time
                        ,  'info', boat.info
                        ,  'updated', boat.updated
                        ,  'created', boat.created ) as boat
            ,  sche.fish_type
            ,  sche.capacity
            ,  sche.confirm_count
            ,  sche.wating_count
            ,  sche.price
            ,  ( select  JSON_OBJECT('id', u.id, 'name', u.name)
                 from    user u
                 where   u.id = sche.captain_id
                 and     u.use_yn = 'Y' ) captain_name
            ,  sche.updated
            ,  sche.created
        from   schedule sche
            ,  boat_master boat
        where  sche.use_yn = 'Y'
        and    sche.boat_id = boat.id
        #----------------------------------
        and    sche.app_id = ?
        and    sche.yyyymmdd between ? and ?
        #----------------------------------
        order  by sche.yyyymmdd
        ;
         `, [appid, fromdate, todate]);
    
    ctx.body = rows
};


/**
 * 아이디로 일정 조회
 */
exports.getScheduleById = async (ctx) => {

    const id = ctx.params.id;
    console.log('[getScheduleById] id : ', id);

    const schedule = await Schedule.get(dbservice.pool(), id);
    if (!schedule) ctx.throw(404, `No schedule ${ctx.params.id} found`); // Not Found

    ctx.response.body = schedule;
};


exports.getScheduleBy = async (ctx) => {

    const id = ctx.params.id;
    console.log('[getScheduleById] id : ', id);

    const schedule = await Schedule.getBy(dbservice.pool(), 'id2', id);
    if (!schedule) ctx.throw(404, `No schedule ${ctx.params.id} found`); // Not Found

    ctx.response.body = schedule;
};


/**
 * 일정 등록
 */
exports.postSchedules = async (ctx) => {

    const values = ctx.request.body;
    const id = await Schedule.insert(dbservice.pool(), values);

    const schedule = await Schedule.get(dbservice.pool(), id);
    if (!schedule) ctx.throw(404, `No schedule ${ctx.params.id} found`); // Not Found

    ctx.response.body = schedule;
    ctx.response.status = 201; // Created
}



/**
 * 일정 취소
 *  - 취소사유 : 관리자 취소, 날짜 변경, 데이터 변경
 */
exports.cancleSchedule = async (ctx) => {

    console.log('[cancleSchedule]');
    const id = ctx.params.id;

    // 일정 취소 전 예약내역 조회 ( 예약내역이 존재하면 취소할 수 없다)
    // 예약내역 취소 후 일정 취소가능
    const row = await Schedule.get(dbservice.pool(), id);
    if ( !row ) {
        ctx.throw(403, `삭제할 내역(id : ${id})이 없습니다.`);
    }

    if ( row.use_yn != 'Y') {
        ctx.throw(403, `이미 취소된 내역(id : ${id})입니다.`);
    }


    let values = {};
    values.use_yn = "N";
    values.cancle_code = ctx.request.body.cancleCode;
    values.cancle_reason = ctx.request.body.cancleReason;
    //values.cancle_date = new Date();
    values.cancle_date = SqlString.raw('NOW()');



    
    await Schedule.update(dbservice.pool(), id, values);

    const schedule = await Schedule.get(dbservice.pool(), id);
    if (!schedule) ctx.throw(404, `No schedule ${ctx.params.id} found`); // Not Found

    ctx.response.body = schedule;
}



/**
 * 일정 삭제
 */
exports.deleteSchedule = async (ctx) => {
    console.log('[cancleSchedule]');
    const id = ctx.params.id;
    await Schedule.delete(dbservice.pool(), id);

    const schedule = await Schedule.get(dbservice.pool(), id);
    if (!schedule) ctx.throw(404, `No schedule ${ctx.params.id} found`); // Not Found

    ctx.response.body = schedule;
}