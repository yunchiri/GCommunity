const Router = require('koa-router');
const users = require('./users.controller');
const router = new Router();


router.get('/', users.list);
router.post('/', users.create);
router.delete('/:uid', users.delete);
router.put('/:uid', users.replace);
router.patch('/:uid', users.update);

module.exports = router;