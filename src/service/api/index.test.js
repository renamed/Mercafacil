const test = require('tape-async');
const service = require('./service')

test('New User',async (t) =>  {    
    try { await service.addOrUpdateUser(null); t.fail('New user passing null'); } catch(e) {t.pass('New user passing null');}
    t.end();
});