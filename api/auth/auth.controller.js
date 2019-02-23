const dbservice = require('../../services/db.service')
const authservice = require('../../services/auth.service')
const path = require('path');
const validation = require('../../lib/validation-errors')

const UserMaster = require('../../models/user_master')



exports.login = async (ctx) => {

    let provider = ctx.request.body.provider
    let provider_uid = ctx.request.body.provider_uid
    
    if (validation.empty(provider)) throw new Error(401, '');
    if (validation.empty(provider_uid)) throw new Error(400, '');

    passport.authenticate('kakao')(ctx)
    
    const user = await UserMaster.getSocialLoginInfo(provider, provider_uid)
    if (user === undefined){
        ctx.status = 401
        ctx.body = 'login fail'
        return
    }

    var token = authservice.signToken(user);
    ctx.body = token
    
};

exports.logout = async (ctx) => {
    //don't need logout
};


exports.loginKakao = ( ctx ) => {
    passport.authenticate('kakao')(ctx)
}

exports.loginKakaoCallback = ( ctx ) => {
    passport.authenticate('kakao',{
        failureRedirect : '/v1/auth/login/kakao/'
    })(ctx)
}
