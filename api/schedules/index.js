const Router = require('koa-router');
const ctrl = require('./schedules.controller');
const router = new Router();

// 일정 조회
router.get(  '/',            ctrl.scheduleList);         // 일정리스트 조회
router.get(  '/:id',         ctrl.getScheduleById);      // 일정 조회
//----------------------------------------------------
router.get(  '/test/:id',    ctrl.getScheduleBy);        // 테스트
//----------------------------------------------------
router.post( '/',            ctrl.postSchedules);        // 일정 등록
router.patch('/:id/cancle',  ctrl.cancleSchedule);       // 일정 취소

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

module.exports = router;