const Router = require('koa-router');
const ctrl = require('./reservations.controller');
const router = new Router();


router.get(  '/',            ctrl.getReservationList);     // 예약 내역 조회
router.get(  '/:id',         ctrl.getReservationById);     // 아이디로 예약 내역 조회
router.post( '/',            ctrl.postReservation);        // 예약 등록
router.patch('/:id',         ctrl.patchReservation);       // 예약 수정
router.patch('/:id/cancle',  ctrl.cancleReservation);       // 예약 취소
router.delete('/:id',        ctrl.deleteReservation);      // 예약 삭제




module.exports = router;