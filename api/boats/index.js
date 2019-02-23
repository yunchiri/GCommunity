const Router = require('koa-router');
const ctrl = require('./boats.controller');
const router = new Router();

router.get(  '/',            ctrl.getBoatList);     // 배 마스터 리스트 조회
router.get(  '/:id',         ctrl.getBoatById);     // 아이디로 배 마스터 조회
router.post( '/',            ctrl.postBoat);        // 배 마스터 등록
router.patch('/:id',         ctrl.patchBoat);       // 배 마스터 수정
router.delete('/:id',        ctrl.deleteBoat);      // 배 마스터 삭제

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

module.exports = router;