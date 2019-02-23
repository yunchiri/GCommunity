const useragent = require("useragent");


class Log {

    /**
     * Log an access to the log-access capped collections.
     *
     * @param {Object} ctx - Koa context (response status is expected to be in ctx.response.status).
     * @param {number} time - duration of the request.
     */
    static async access(ctx, time) {
        // don't log development environment
        //if (ctx.app.env == 'development') return;

        const request = {
            method:   ctx.request.method,
            host:     ctx.request.host,
            url:      ctx.request.url,
            ip:       ctx.request.ip,
            referrer: ctx.request.headers.referer,
            status:   ctx.response.status,
            ms:       Math.ceil(time),
        };

        const ua = useragent.parse(ctx.request.headers['user-agent']);
        request.ua = Object.assign({}, ua, { os: ua.os }); // trigger on-demand parsing of os

        if (ctx.response.header.location) {
            request.redir = ctx.response.header.location;
        }

        // logging uses capped collection log-access (size: 1000×1e3, max: 1000)
        // const logCollection = global.mongoDb.collection('log-access');
        // await logCollection.insertOne(request);
        console.log(request);
    }


    /**
     * Log an error to the log-error capped collections.
     *
     * @param {Object} ctx - Koa context (response status is expected to be in ctx.response.status).
     * @param {Object} err - the Error object.
     */
    static async error(ctx, err) {
        // don't log development environment (but display status 500 errors)
        // if (ctx.app.env == 'development') { 
        //     if (ctx.response.status==500) {
        //         console.error(err); 
        //     }
        //     return; 
        // }

        const request = {
            method: ctx.request.method,
            host:   ctx.request.host,
            url:    ctx.request.url,
            ip:     ctx.request.ip,
            status: ctx.response.status,
        };

        const ua = useragent.parse(ctx.request.headers['user-agent']);
        request.ua = Object.assign({}, ua, { os: ua.os }); // trigger on-demand parsing of os

        if (ctx.response.status == 500) {
            request.stack = err.stack;
        }

        // logging uses capped collection log-error (size: 1000×4e3, max: 1000)
        const logCollection = global.mongoDb.collection('log-error');
        await logCollection.insertOne(request);

        // e-mail notification
        /*
        try {
            const to = 'chrisv@movable-type.co.uk'; // could be from env var
            if (ctx.state == 500) await Mail.sendText(to, 'Koa Sample Webb App 500 error', err.stack, ctx);
        } catch (e) {
            console.error('log', e);
        }
        */

        console.error(request);
    }


    /**
     * Log or notify unhandled exception e.g. from within models.
     *
     * @param {string} method - module/method exception was raised within
     * @param {Object} err
     */
    static exception(method, err) {
        // could eg save to log file or e-mail developer
        console.error('UNHANDLED EXCEPTION', method, err.stack===undefined?err.message:err.stack);
    }
}


module.exports = Log;