var express = require('express');
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');

const sc = require('./controllers/schema');

// GraphQL schema
const schema = buildSchema(sc.getSchema());

const controllers = require('./controllers');

// Root resolver
var root = {
    upsertUser: controllers.addOrUpdateUser,
    upsertWebsite: controllers.addOrUpdateWebsite,
    newVisit: controllers.recordNewVisit,

    User: controllers.getUser,
    UserByEmail: controllers.getUser,
    Users: controllers.getUserCursor,

    Website: controllers.getWebsite,
    WebsiteByUrl: controllers.getWebsite,
    Websites: controllers.getWebsiteCursor,

    StatsTotal: controllers.getStatsByTimespan,
    StatsByWebsite: controllers.getStatsByWebsite,
    StatsByUser: controllers.getStatsByUser

};
// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.listen(8666, () => console.log('Express GraphQL Server Now Running'));
