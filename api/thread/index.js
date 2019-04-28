const Router = require('koa-router');
const talk = require('./talk.controller');
const router = new Router();


router.get('/', talk.list);
router.post('/', talk.create);
router.delete('/:uid', talk.delete);
router.put('/:uid', talk.replace);
router.patch('/:uid', talk.update);

module.exports = router;