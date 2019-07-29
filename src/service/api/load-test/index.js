'use strict' 

const EasyGraphQLLoadTester = require('easygraphql-load-tester');
const userSchema = require('../controllers/schema');

const args = {
    upsertUser: {
        email: "renatoQuerTrabalhar@mercafacil.com.br",
        name: "Renato Medeiros",
        gender: "MALE",
        date_of_birth: '1987-06-11'

    },
    newVisit: {
        website_url: "http://www.mercafacil.com.br",
        user_email: "renamedrj@gmail.com"
    },
    upsertWebsite: {
        url: "http://www.uol.com.br",
        topic: "Chatice"
    },
    User: {
        id: '1'
    },
    UserByEmail: {
        email: "renamedrj@gmail.com"
    },
    Users: {
        limit: 10,
        skip: 0,
        sort_field: "id",
        sort_order: "ASC"
    },
    Website: {
        id: '1'
    },
    WebsiteByUrl: {
        url: 'http://www.uol.com.br'
    },
    Websites: {
        limit: 666,
        skip: 0,
        sort_field: "id",
        sort_order: "DESC"
    },
    StatsTotal: {
        initial_timestamp: '2019-07-25',
        final_timestamp: '2019-08-01'
    },
    StatsByWebsite: {
        initial_timestamp: null,
        final_timestamp: null,
        min_age: 18,
        max_age: 49,
        gender: null,
        users: ["renamedrj@gmail.com"],
        websites: ["http://www.mercafacil.com.br"]
    },
    StatsByUser: {
        initial_timestamp: null,
        final_timestamp: null,
        min_age: 18,
        max_age: null,
        gender: null,
        users: ["renamedrj@gmail.com"],
        websites: null
    }
  };

const loadTester = new EasyGraphQLLoadTester(userSchema.getSchema(), args);
 
const options = {
    withMutations: true
};

const testCases = loadTester.artillery(options);

module.exports = {
    testCases
  };