const passport = require('koa-passport')
const JWTStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const KakaoStrategy = require('passport-kakao').Strategy
const dbservice = require('./dbservice');
const jwt = require('jsonwebtoken');

const validation = require('../lib/validation-errors')

const UserMaster = require('../models/user_master')


exports.config = {
    SECRET : 'fjklajflksjfaslk'
    ,EXPIRES :  1296000 
    ,REFRESH_EXPIRES : 2628000 
    ,AUDIENCE : "fishiwang"
}


// JWT 토큰 생성 함수
exports.signToken = (user) => {
    let uid = user.id
    return jwt.sign({uid: uid, audience : this.config.AUDIENCE }, this.config.SECRET );
}

exports.signAccessToken = (user) => {
    return jwt.sign({userid: user.userid}, this.config.SECRET, { expiresIn: this.config.EXPIRES });
}

exports.signRefreshToken = (user) => {
    let randomeWord =  randomWords()
    return jwt.sign({userid: user.userid , username : randomeWord, audience : this.config.AUDIENCE}, this.config.REFRESH_SECRET, { expiresIn: this.config.REFRESH_EXPIRES });
}

exports.verifyRefreshToken = (token) => {
    
    return jwt.verify(token, this.config.REFRESH_SECRET)

}

exports.isAuthenticated = (ctx) => {
    const token = req.headers.authorization;
    
    // // 토큰 인증 로직
    // validateJwt(req, res, next);
    // req.headers.authorization = 'Bearer ' + token;
    
    expressjwt({secret: this.config.SECRET})(req, res, function() {
        if ( !req.user) return res.status(401).json({result : 0, message : "로그인 필요"});
        next();
    });
}

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = this.config.SECRET;

  
passport.use(new JWTStrategy(opts, async (jwt_payload, done) => {
    // return done({err:'bad jwt'}, null)

    var mac =jwt_payload.mac
    var audience = jwt_payload.audience

    if (audience !== this.config.AUDIENCE){
        return done('bad jwt', null)
    }
    if (mac){
        return done(null, mac)
    }else{
        return done(null, false)
    }

}))


passport.use(new KakaoStrategy({
    clientID: '7d958c94cdd7ff340e259c39679f704b',
    callbackURL: '/V1/auth/login/kakao/callback'
},
 async (accessToken, refreshToken, profile, done) => {
    // 사용자의 정보는 profile에 들어있다.
    // console.log(profile);
    // done(null, profile);

    let provider = profile.provider;
    let provider_user_id = profile.id;

    if (validation.empty(provider)) throw new Error(401, '');
    if (validation.empty(provider_uid)) throw new Error(400, '');

    const parameter = [provider, provider_user_id];

    const user = await UserMaster.getSocialLoginInfo(provider, provider_uid)
    if (user === undefined){
        ctx.status = 401
        ctx.body = 'login fail'
        return
    }
    return done(null, user[0]);
        
    // db.excuteSql(query, parameter, (err, result) => {
    //     if (err) {
    //         return done(err, null);
    //     }
    //     //success
    //     if (result.length === 0) {
    //         return done(null, false, '회원이 없습니다');
    //     }
    //     let user = result[0];
    //     return done(null, user);
    // });
}
));