const dbservice = require('../../services/db.service')
const path = require('path');

exports.list = async (ctx) => {
    let [rows, fields] = await dbservice.pool().query('select * from games', [])
    ctx.body = rows
};



exports.create = (ctx) => {
    ctx.body = 'created';
};

exports.delete = async (ctx) => {
    let gid = ctx.params.gid
    let [rows, fields] = await dbservice.pool().query('delete from games where gid = ?', [gid])
    ctx.body = rows
};

exports.replace = (ctx) => {
    ctx.body = 'replaced';
};

exports.update = (ctx) => {
    ctx.body = 'updated';
};