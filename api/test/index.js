const Router = require('koa-router');
const test = require('./test.controller');
const router = new Router();


router.get('/:id', test.testById);

router.post('/', test.postTest);


module.exports = router;