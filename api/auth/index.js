const Router = require('koa-router');
const authCtrl = require('./auth.controller');
const router = new Router();


router.post('/login', authCtrl.login);
router.post('/social/login/kakao', authCtrl.loginKakao);

router.post('/logout', authCtrl.logout);

router.post('/login/kakao', authCtrl.loginKakao);
router.post('/signup/kakao', authCtrl.loginKakao);

module.exports = router;