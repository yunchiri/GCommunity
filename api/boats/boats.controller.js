const dbservice = require('../../services/dbservice');
const validation = require('../../lib/validation-errors.js');

const BoatMaster = require('../../models/boat_master.js');
var SqlString = require('sqlstring');

/**
 * 배 마스터 리스트 조회
 */
exports.getBoatList = async (ctx) => {

    const appid = ctx.query.appid
    if ( validation.empty(appid)) {
        throw new ModelError(403, '앱 아이디가 누락되었습니다.');
    }

    const sql =
    `
    select boat.id
        ,  boat.name
        ,  boat.app_id
        ,  boat.type
        ,  case when boat.type = 0 then '일반낚시'
                when boat.type = 1 then '종일낚시'
                when boat.type = 2 then '시간낚시'
                else '등록안됨' end type_name
        ,  boat.captain_id
        ,  ( select  JSON_OBJECT('id', u.id, 'name', u.name)
             from    user u
             where   u.id = boat.captain_id
             and     u.use_yn = 'Y' ) captain
        ,  boat.capacity
        ,  boat.fish_type
        ,  boat.from_time
        ,  boat.to_time
        ,  boat.info
        ,  boat.use_yn
        ,  boat.cancle_date
        ,  boat.updated
        ,  boat.created
    from   boat_master boat
    where  1=1
    and    boat.use_yn = 'Y'
    #----------------------------------
    and    boat.app_id = ?
    #----------------------------------
    ;    
    `

    let [rows, fields] = await dbservice.pool().query(sql, [appid]);
    
    ctx.body = rows
};



/**
 * 아이디로 배 마스터 조회
 */
exports.getBoatById = async (ctx) => {

    const id = ctx.params.id;

    const appid = ctx.query.appid
    if ( validation.empty(appid)) {
        throw new ModelError(403, '앱 아이디가 누락되었습니다.');
    }

    const sql =
    `
    select boat.id
        ,  boat.name
        ,  boat.app_id
        ,  boat.type
        ,  case when boat.type = 0 then '일반낚시'
                when boat.type = 1 then '종일낚시'
                when boat.type = 2 then '시간낚시'
                else '등록안됨' end type_name
        ,  boat.captain_id
        ,  ( select  JSON_OBJECT('id', u.id, 'name', u.name)
            from    user u
            where   u.id = boat.captain_id
            and     u.use_yn = 'Y' ) captain
        ,  boat.capacity
        ,  boat.fish_type
        ,  boat.from_time
        ,  boat.to_time
        ,  boat.info
        ,  boat.use_yn
        ,  boat.cancle_date
        ,  boat.updated
        ,  boat.created
    from   boat_master boat
    where  1=1
    and    boat.use_yn = 'Y'
    #----------------------------------
    and    boat.app_id = ?
    and    boat.id     = ?
    #----------------------------------
    limit 1
    ;    
    `

    let [rows, fields] = await dbservice.pool().query(sql, [appid, id]);
    if (!rows) ctx.throw(404, `No schedule ${ctx.params.id} found`); // Not Found

    ctx.response.body = rows[0];
};



/**
 * 배 마스터 등록
 */
exports.postBoat = async (ctx) => {

    const values = ctx.request.body;
    const id = await BoatMaster.insert(dbservice.pool(), values);

    const result = await BoatMaster.get(dbservice.pool(), id);
    if (!result) ctx.throw(404, `No boat_master ${ctx.params.id} found`); // Not Found

    ctx.response.body = result;
    ctx.response.status = 201; // Created
}


/**
 * 배 마스터 수정
 */
exports.patchBoat = async (ctx) => {

    const id = ctx.params.id;
    await Schedule.delete(dbservice.pool(), id);

    const schedule = await BoatMaster.get(dbservice.pool(), id);
    if (!schedule) ctx.throw(404, `No schedule ${ctx.params.id} found`); // Not Found

    ctx.response.body = schedule;
}



/**
 * 배 마스터 삭제
 */
exports.deleteBoat = async (ctx) => {

    const id = ctx.params.id;
    await BoatMaster.delete(dbservice.pool(), id);

    const schedule = await BoatMaster.get(dbservice.pool(), id);
    if (!schedule) ctx.throw(404, `No boat_master ${ctx.params.id} found`); // Not Found

    ctx.response.body = schedule;
}