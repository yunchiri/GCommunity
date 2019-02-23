const Koa = require("koa");
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

// const MongoClient = require('mongodb').MongoClient;
const users = require('./api/users')
const apps = require('./api/apps')
const auth = require('./api/auth')

const Log = require('./lib/log')

const appconfig = require('./config/appconfig')


// log requests (into mongodb capped collection)
app.use(async function logAccess(ctx, next) {
    const t1 = Date.now();
    await next();
    const t2 = Date.now();

    await Log.access(ctx, t2 - t1);
});


/**
 * 에러 핸들러
 */
app.use(async function handleErrors(ctx, next) {
    try {

        await next();

    } catch (err) {
        ctx.response.status = err.status || 500;
        switch (ctx.response.status) {
            case 204: // No Content
                break;
            case 401: // Unauthorized
                ctx.response.set('WWW-Authenticate', 'Basic');
                break;
            case 403: // Forbidden
            case 404: // Not Found
            case 406: // Not Acceptable
            case 409: // Conflict
                ctx.response.body = { message: err.message, root: 'error' };
                break;
            default:
            case 500: // Internal Server Error (for uncaught or programming errors)
                console.error(ctx.response.status, err.message);
                ctx.response.body = { message: err.message, root: 'error' };
                if (app.env != 'production') ctx.response.body.stack = err.stack;
                // ctx.app.emit('error', err, ctx); // github.com/koajs/koa/wiki/Error-Handling
                break;
        }
        await Log.error(ctx, err);
        console.log('err', err);
    }
});


app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

router.use('/api/usres', users.routes())
router.use('/api/apps', apps.routes())

router.use('/api/auth', auth.routes())


// MongoDB connection pool (set up on app initialisation) - mongo has no synchronous connect, so emit
// 'mongodbReady' when connected (note mongodbReady lister has to be set before event is emitted)
// MongoClient.connect(appconfig.mongodb.url, { useNewUrlParser: true })
//     .then(client => {
//         global.mongoDb = client.db(client.s.options.dbName);
//         // if empty db, create capped collections for logs (if not createCollection() calls do nothing)
//         global.mongoDb.createCollection('log-access', { capped: true, size: 100*1e3, max: 100 });
//         global.mongoDb.createCollection('log-error',  { capped: true, size: 100*4e3, max: 100 });
//     })
//     .then(() => {
//         app.emit('mongodbReady');
//     })
//     .catch(err => {
//         console.error(`Mongo connection error: ${err.message}`);
//         process.exit(1);
//     });


app.listen(12113, () => {
    console.log('PatchAid Apiserver on port : 12113');
});