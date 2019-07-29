const test = require('tape-async');
const service = require('./service')
const repository = require('./repository')

test('Get User', async(t) => {
    const getUser = repository.getUser;
    repository.getUser = async function(params) {
        return Promise.resolve({
            UserId: 1,
            Email: "renamedrj@gmail.com",
            Gender: "MALE",
            Name: "Renato"
        });
    };
    try {
        await service.getUser(null);
        t.fail("No user provided");
    } catch(e) {
        t.pass("No user provided");
    }

    try {
        await service.getUser({});
        t.fail("No UserId and no user email");
    } catch(e) {
        t.pass("No UserId and no user email");
    }

    let user = await service.getUser({id: 1});
    t.equals(user.id, 1, "User id");
    t.equals(user.email, "renamedrj@gmail.com", "User email");
    t.equals(user.gender, "MALE", "User gender");
    t.equals(user.name, "Renato", "User name");

    repository.getUser = getUser;
    t.end();
});

test('Get User Cursor', async(t) => {
    let userCursorRepo = repository.getUserCursor;
    repository.getUserCursor = async function(param) {
        return Promise.resolve([
            {
                UserId: 1,
                Email: "renamedrj@gmail.com",
                Gender: "MALE",
                Name: "Renato"
            },
            {
                UserId: 2,
                Email: "iggychato@gmail.com",
                Gender: "MALE",
                Name: "Iggy"
            }
        ]);
    };

    try {
        await service.getUserCursor(null);
        t.fail("No filters provided");
    } catch(e) {
        t.pass("No filters provided");
    }

    try {
        await service.getUserCursor({sort_order: "blablabla"});
        t.fail("Invalid sort order");
    } catch(e) {
        t.pass("Invalid sort order");
    }

    try {
        await service.getUserCursor({sort_field: "blablabla"});
        t.fail("Invalid sort field");
    } catch(e) {
        t.pass("Invalid sort field");
    }

    let users = await service.getUserCursor({});
    t.equals(Array.isArray(users), true, "Retuns array");
    t.equals(users.length, 2, "Number of elements in array");
    t.equals(users[0].id, 1, "id element 1");
    t.equals(users[0].email, "renamedrj@gmail.com", "email element 1");
    t.equals(users[0].gender, "MALE", "gender element 1");
    t.equals(users[0].name, "Renato", "name element 1");

    t.equals(users[1].id, 2, "id element 2");
    t.equals(users[1].email, "iggychato@gmail.com", "email element 2");
    t.equals(users[1].gender, "MALE", "gender element 2");
    t.equals(users[1].name, "Iggy", "name element 2");

    repository.getUserCursor = userCursorRepo;
    t.end();
});

test('Get Website Cursor', async(t) => {
    let websiteCursorRepo = repository.getWebsiteCursor;
    repository.getWebsiteCursor = async function(param) {
        return Promise.resolve([
            {
                WebsiteId: 1,
                Url: "http://www.fantastico.com.br",
                Topic: "Sensacionalismo"
            },
            {
                WebsiteId: 2,
                Url: "http://www.mercafacil.com.br",
                Topic: "Lugar onde trabalharei"
            }
        ]);
    };

    try {
        await service.getWebsiteCursor(null);
        t.fail("No filters provided");
    } catch(e) {
        t.pass("No filters provided");
    }

    try {
        await service.getWebsiteCursor({sort_order: "blablabla"});
        t.fail("Invalid sort order");
    } catch(e) {
        t.pass("Invalid sort order");
    }

    try {
        await service.getWebsiteCursor({sort_field: "blablabla"});
        t.fail("Invalid sort field");
    } catch(e) {
        t.pass("Invalid sort field");
    }

    let users = await service.getWebsiteCursor({});
    t.equals(Array.isArray(users), true, "Retuns array");
    t.equals(users.length, 2, "Number of elements in array");
    t.equals(users[0].id, 1, "id element 1");
    t.equals(users[0].url, "http://www.fantastico.com.br", "url element 1");
    t.equals(users[0].topic, "Sensacionalismo", "topic element 1");

    t.equals(users[1].id, 2, "id element 2");
    t.equals(users[1].url, "http://www.mercafacil.com.br", "url element 2");
    t.equals(users[1].topic, "Lugar onde trabalharei", "Topic element 2");

    repository.getWebsiteCursor = websiteCursorRepo;
    t.end();
});

test('Get Website', async(t) => {
    const getWebsite = repository.getWebsite;
    repository.getWebsite = async function(params) {
        return Promise.resolve({
            WebsiteId: 1,
            Url: "http://www.uol.com.br",
            Topic: "Chatice"
        });
    };
    try {
        await service.getWebsite(null);
        t.fail("No website provided");
    } catch(e) {
        t.pass("No website provided");
    }

    try {
        await service.getWebsite({});
        t.fail("No WebsiteId and no website url");
    } catch(e) {
        t.pass("No WebsiteId and no website url");
    }

    let website = await service.getWebsite({id: 1});
    t.equals(website.id, 1, "Website id");
    t.equals(website.url, "http://www.uol.com.br", "Website url");
    t.equals(website.topic, "Chatice", "Website topic");

    repository.getWebsite = getWebsite;
    t.end();
});

test('New User', async (t) =>  {    
    const upsertUser = repository.upsertUser;
    repository.upsertUser = async function(user) {
        return Promise.resolve(1);
    }

    try {
        await service.addOrUpdateUser(null);
        t.fail("No user provided");
    } catch(e) {
        t.pass("No user provided");
    }

    try {
        await service.addOrUpdateUser({});
        t.fail("No email provided");
    } catch(e) {
        t.pass("No email provided");
    }

    try {
        await service.addOrUpdateUser({email: "sdfsf sf sf"});
        t.fail("Invalid email provided");
    } catch(e) {
        t.pass("Invalid email provided");
    }

    try {
        await service.addOrUpdateUser({email: "meuemail@aee.com.br"});
        t.fail("No gender provided");
    } catch(e) {
        t.pass("No gender provided");
    }

    try {
        await service.addOrUpdateUser({email: "meuemail@aee.com.br", gender: "malle"});
        t.fail("Invalid gender");
    } catch(e) {
        t.pass("Invalid gender");
    }

    
    let user = await service.addOrUpdateUser({email: "meuemail@aee.com.br", gender: "male"});
    t.equals(user.id, 1);
    
    repository.upsertUser = upsertUser;

    t.end();
});

test('New Website', async(t) => {
    const upsertWebsite = repository.upsertWebsite;
    repository.upsertWebsite = async function(website) {
        return Promise.resolve(1);
    };

    try {
        await service.addOrUpdateWebsite(null);
        t.fail("No input param provided");
    } catch(e) {
        t.pass("No input param provided");
    }

    try {
        await service.addOrUpdateWebsite({});
        t.fail("No URL provided");
    } catch(e) {
        t.pass("No URL provided");
    }

    try {
        await service.addOrUpdateWebsite({url: "akdj ajs ak"});
        t.fail("Malformed URL provided");
    } catch(e) {
        t.pass("Malformed URL provided");
    }

    try {
        await service.addOrUpdateWebsite({url: "www.mercafacil.com.br"});
        t.fail("No protocol URL");
    } catch(e) {
        t.pass("No protocol URL");
    }

    let nwebsite = await service.addOrUpdateWebsite({url: "http://www.mercafacil.com.br"});
    t.equals(nwebsite.id, 1, "Inserted id");
    t.equals(nwebsite.topic, null, "Null (not undefined) topic");
    t.equals(nwebsite.hostname, "www.mercafacil.com.br", "Hostname extracted correctly");

    repository.upsertWebsite = upsertWebsite;

    t.end();
});

test('New visit', async(t) => {
    const upsertWebsite = repository.upsertWebsite;
    const upsertUser = repository.upsertUser;
    const getWebsite = repository.getWebsite;
    const getUser = repository.getUser;
    const recordNewVisit = repository.recordNewVisit;
    repository.upsertUser = async function(user) {
        return Promise.resolve(1);
    }
    repository.upsertWebsite = async function(website) {
        return Promise.resolve(1);
    };
    repository.recordNewVisit = async function(visit) {
        return Promise.resolve({VisitId: 1});
    };
    repository.getWebsite = async function(params) {
        return Promise.resolve(null);
    };
    repository.getUser = async function(params) {
        return Promise.resolve(null);
    }

    let nvisit = await service.recordNewVisit({website_url: "http://www.mercafacil.com.br", user_email: "renamedrj@gmail.com"});

    t.equals(1, nvisit.id, "New visit id");
    t.equals(1, nvisit.user.id, "New visit user id");
    t.equals(1, nvisit.website.id, "New visit website id");
    t.equals("UNIDENTIFIED", nvisit.user.gender, "Unindentified gender");
    t.equals("renamedrj@gmail.com", nvisit.user.email, "Visit user email");
    t.equals("http://www.mercafacil.com.br", nvisit.website.url, "Visit website url");

    repository.upsertUser = upsertUser;
    repository.upsertWebsite = upsertWebsite;
    repository.recordNewVisit = recordNewVisit;
    repository.getWebsite = getWebsite;
    repository.getUser = getUser;

    t.end();
});