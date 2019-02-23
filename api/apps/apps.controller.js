const dbservice = require('../../services/db.service')
const path = require('path');


///
/// 앱마스터 정보 조회
///
exports.appList = async (ctx) => {
    // let appid = ctx.params.appid
    // let limit = (ctx.query.limit ? parseInt(ctx.query.limit) : 999)
    // let offset = (ctx.query.offset ? parseInt(ctx.query.offset) : 0)
    let [rows, fields] = await dbservice.pool().query(
        `select app.id
             ,  app.name
             ,  app.use_yn
             ,  app.updated
             ,  app.created 
         from   app_master app
         where  app.use_yn = 'Y';
         `);
    
    ctx.body = rows
};


///
/// 앱마스터 정보를 아이디로 조회
///
exports.appDataByAppId = async(ctx) => {
    const appid = ctx.params.id;

    let [rows, fields] = await dbservice.pool().query(
        `select app.id
             ,  app.name
             ,  app.use_yn
             ,  app.updated
             ,  app.created 
         from   app_master app
         where  app.use_yn = 'Y'
         and    app.id = ${appid}
         limit 1;
         `);
    
    ctx.body = rows
}


exports.getApp = async (ctx) => {
    let appid = ctx.params.appid
    let [rows, fields] = await dbservice.pool().query('select * from appdata where app_id = ?', [appid])
    ctx.body = rows[0]
};




exports.create = (ctx) => {
    ctx.body = 'created';
};

///
/// 앱 마스터 정보 삭제
///
exports.delete = async (ctx) => {
    let appid = ctx.params.id
    let [rows, fields] = await dbservice.pool().query(
        `
        update app_master
        set    use_yn = 'N'
            ,  cancle_date = now()
        where  id = ? 
        and    use_yn = 'Y'
        `, [appid])
    ctx.body = rows
};

exports.replace = (ctx) => {
    ctx.body = 'replaced';
};



exports.update = (ctx) => {
    ctx.body = 'updated';
};


exports.replaceWorkpath = async (ctx) => {
    let appid = ctx.params.appid
    let workpath = ctx.request.body.workpath

    let [rows, fields] = await dbservice.pool().query('update appdata set workpath = ? where app_id = ?', [workpath, appid])
    ctx.body = rows
};