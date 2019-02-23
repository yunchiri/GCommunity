const Router = require('koa-router');
const apps = require('./apps.controller');
const router = new Router();

// 앱마스터 정보 조회
router.get('/', apps.appList);
// 앱마스터 정보를 아이디로 조회
router.get('/:id', apps.appDataByAppId);

router.post('/', apps.create);
// 앱 마스터 정보 삭제
router.delete('/:id', apps.delete);
router.put('/', apps.replace);
router.patch('/', apps.update);

module.exports = router;