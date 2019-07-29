'use strict';

const repository = require('../repository');
const validator = require('validator');
const url = require('url');

const MIN_DATE = new Date(0);
const MAX_DATE = new Date(32503679999000);
const MAX_AGE = 666;

module.exports.addOrUpdateUser = async function(user) {
    if (!user) {
        throw new Error('No User provided');
    }

    if (!user.email)
        throw new Error('Email is a mandatory field');
    
    if (!validator.isEmail(user.email))
        throw new Error('Email provided is not valid');
    
    if (!user.gender)
        throw new Error('Gender is a mandatory field');
    
    user.gender = user.gender.toUpperCase();
    if (user.gender != 'MALE'
        && user.gender != 'FEMALE'
        && user.gender != 'UNIDENTIFIED')
        throw new Error(`${user.gender} is not a valid gender type.`);

    if (!user.name)
        user.name = null;

    if (!user.date_of_birth)
        user.date_of_birth = null;

    user.email = validator.normalizeEmail(user.email);
    user.id = await repository.upsertUser(user);
    return user;
}

module.exports.addOrUpdateWebsite = async function(website) {
    if (!website)
        throw new Error('No Website provided');
    
    if (!website.url)
        throw new Error('Website URL is a mandatory field');
    
    let urlValidationOptions = {
        protocols: ['http','https'], 
        require_tld: true,
        require_protocol: true, 
        require_host: true,
        require_valid_protocol: true, 
        allow_underscores: true, 
        host_whitelist: false, 
        host_blacklist: false, 
        allow_trailing_dot: false,
         allow_protocol_relative_urls: false, 
         disallow_auth: false
    };
    if (!validator.isURL(website.url, urlValidationOptions))
        throw new Error('The input URL is not valid');
    
    website.topic = website.topic ? website.topic : null;
    website.hostname = url.parse(website.url).hostname;

    website.id = await repository.upsertWebsite(website);
    return website;
}

module.exports.getUser = async function(user) {
    if (!user)
        throw new Error('No User provided');
    
    if (!user.email && !user.id)
        throw new Error('Either Email or Id must be informed to query an user');

    user.email = user.email ? validator.normalizeEmail(user.email) : null;
    user.id = user.id ? user.id : null;

    let nuser = await repository.getUser(user);
    if (!nuser)
        return null;

    return {
        id : nuser.UserId,
        email : nuser.Email,
        gender : nuser.Gender,
        name : nuser.Name,
        date_of_birth : nuser.BirthDate
    };
}

module.exports.getUserCursor = async function(cursorParams) {
    if (!cursorParams)
        throw new Error('No filters provided');
    
    cursorParams.limit = cursorParams.limit ? cursorParams.limit : 20;    
    cursorParams.skip = cursorParams.skip ? cursorParams.skip : 0;
    cursorParams.sort_order = cursorParams.sort_order ? cursorParams.sort_order : "ASC";

    if (cursorParams.sort_order != "ASC" && cursorParams.sort_order != "DESC")
        throw new Error(`Sorting field must be either ASC or DESC. ${cursorParams.sort_order} is not valid.`);

    cursorParams.sort_field = cursorParams.sort_field ? cursorParams.sort_field : "name";
    if (cursorParams.sort_field != "id"
        && cursorParams.sort_field != "name"
        && cursorParams.sort_field != "gender"
        && cursorParams.sort_field != "email"
        && cursorParams.sort_field != "date_of_birth")
        throw new Error('Sort field has an invalid value.');
    
    let userCursor = await repository.getUserCursor(cursorParams);
    let users = [];
    userCursor.forEach(nuser => {
        let currUser = {
            id : nuser.UserId,
            email : nuser.Email,
            gender : nuser.Gender,
            name : nuser.Name,
            date_of_birth : nuser.BirthDate
        };
        users.push(currUser);
    });
    return users;
}


module.exports.getWebsite = async function(website) {
    if (!website)
        throw new Error('No User provided');
    
    if (!website.url && !website.id)
        throw new Error('Either URL or Id must be informed to query a website');

    if(website.url)
        website.hostname = url.parse(website.url).hostname;
    else
        website.hostname = null;
    
    website.id = website.id ? website.id : null; 

    let nwebsite = await repository.getWebsite(website);
    if (!nwebsite)
        return null;

    return {
        id : nwebsite.WebsiteId,
        url: nwebsite.Url,
        topic: nwebsite.Topic
    };
}

module.exports.getWebsiteCursor = async function(cursorParams) {
    if (!cursorParams)
        throw new Error('No filters provided');
    
    cursorParams.limit = cursorParams.limit ? cursorParams.limit : 20;    
    cursorParams.skip = cursorParams.skip ? cursorParams.skip : 0;
    cursorParams.sort_order = cursorParams.sort_order ? cursorParams.sort_order : "ASC";

    if (cursorParams.sort_order != "ASC" && cursorParams.sort_order != "DESC")
        throw new Error(`Sorting field must be either ASC or DESC. ${cursorParams.sort_order} is not valid.`);

    cursorParams.sort_field = cursorParams.sort_field ? cursorParams.sort_field : "url";
    if (cursorParams.sort_field != "id"
        && cursorParams.sort_field != "url"
        && cursorParams.sort_field != "topic")
        throw new Error('Sort field has an invalid value.');
    
    let websiteCursor = await repository.getWebsiteCursor(cursorParams);
    let websites = [];
    websiteCursor.forEach(nwebsite => {
        let currWebsite = {
            id: nwebsite.WebsiteId,
            url: nwebsite.Url,
            topic: nwebsite.Topic
        };
        websites.push(currWebsite);
    });
    return websites;
}

module.exports.recordNewVisit = async function(visit) {
    let websitePromise = this.getWebsite({url: visit.website_url});
    let userPromise = this.getUser({email: visit.user_email});

    let website = await websitePromise;
    if (!website)
        websitePromise = this.addOrUpdateWebsite({url: visit.website_url});
    
    let user = await userPromise;
    if (!user)
        userPromise = this.addOrUpdateUser({gender: 'UNIDENTIFIED', email: visit.user_email});

    website = await websitePromise;
    user = await userPromise;

    let visitParams = { timestamp: new Date(), userId: user.id, websiteId: website.id };
    let nvisit = await repository.recordNewVisit(visitParams);
    return {
        id: nvisit.VisitId,
        timestamp: visitParams.timestamp,
        website: website,
        user: user
    };
}

module.exports.getStatsByTimespan = async function(statsFilter){
    if (!statsFilter)
        throw new Error('No filters have been received');

    statsFilter.initial_timestamp = statsFilter.initial_timestamp ? new Date(Date.parse(statsFilter.initial_timestamp)) : MIN_DATE;
    statsFilter.final_timestamp = statsFilter.final_timestamp ? new Date(Date.parse(statsFilter.final_timestamp)) : MAX_DATE;
    
    statsFilter.min_age = 0;
    statsFilter.max_age = MAX_AGE;
    statsFilter.gender = null;
    statsFilter.users = null;
    statsFilter.websites = null;
    
    let stats = await repository.getStats(statsFilter);
    
    let users = [];
    let websites = [];
    let visits = [];

    let usersId = new Set();
    let websitesId = new Set();
    stats.forEach(nstat => {
        let currWebsite = {
            id: nstat.WebsiteId,
            url: nstat.Url,
            topic: nstat.Topic
        };

        let currUser = {
            id : nstat.UserId,
            email : nstat.Email,
            gender : nstat.Gender,
            name : nstat.Name,
            date_of_birth : nstat.BirthDate
        };

        let currVisit = {
            id: nstat.VisitId,
            timestamp: nstat.VisitDate,
            user: currUser,
            website: currWebsite
        };

        if (!usersId.has(nstat.UserId)) {
            users.push(currUser);
            usersId.add(nstat.UserId);
        }

        if (!websitesId.has(nstat.WebsiteId)){
            websites.push(currWebsite);
            websitesId.add(nstat.WebsiteId);
        }   
        
        visits.push(currVisit);
    }); 

    return {
        visits_count: visits.length,
        users_count: users.length,
        websites_count: websites.length,
        users: users,
        websites: websites,
        visits: visits
    };
}

module.exports.getStatsByWebsite = async function(statsFilter){
    if (!statsFilter)
        throw new Error('No filters have been received');

    statsFilter.initial_timestamp = statsFilter.initial_timestamp ? new Date(Date.parse(statsFilter.initial_timestamp)) : MIN_DATE;
    statsFilter.final_timestamp = statsFilter.final_timestamp ? new Date(Date.parse(statsFilter.final_timestamp)) : MAX_DATE;
    statsFilter.min_age = statsFilter.min_age ? statsFilter.min_age : 0;
    statsFilter.max_age = statsFilter.max_age ? statsFilter.max_age : MAX_AGE;
    statsFilter.gender = statsFilter.gender ? statsFilter.gender : null;
    statsFilter.users = statsFilter.users && statsFilter.users.length > 0 ? statsFilter.users : null;

    let websiteHost = [];
    if (statsFilter.websites) {
        statsFilter.websites.forEach(element => {
            let hostname = url.parse(website.url).hostname;
            if (hostname)
                websiteHost.push(url.parse(website.url).hostname);
        });
    }
    statsFilter.websites = websiteHost.length > 0 ? websiteHost : null;
    
    let stats = await repository.getStats(statsFilter);
    if (stats == [])
        return null;

    let response = [];
    stats.forEach(nstat => {
        let currWebsite = {
            id: nstat.WebsiteId,
            url: nstat.Url,
            topic: nstat.Topic
        };

        let currUser = {
            id : nstat.UserId,
            email : nstat.Email,
            gender : nstat.Gender,
            name : nstat.Name,
            date_of_birth : nstat.BirthDate
        };

        let currVisit = {
            id: nstat.VisitId,
            timestamp: nstat.VisitDate,
            user: currUser,
            website: currWebsite
        };

        let currStatistic = response.find(x => x.WebsiteId == currWebsite.id);
        if (!currStatistic) {
            currStatistic = {
                WebsiteId: currWebsite.id,
                users_count: 0,
                websites_count: 1,
                visits_count: 0,
                users: [],
                websites: [currWebsite],
                visits: []
            };

            response.push(currStatistic);
        } 

        if (!currStatistic.users.find(u => u.id == currUser.id)) {
            currStatistic.users_count += 1;
            currStatistic.users.push(currUser);
        }

        currStatistic.visits_count += 1;
        currStatistic.visits.push(currVisit);
        
    });
    return response;
}

module.exports.getStatsByUser = async function(statsFilter){
    if (!statsFilter)
        throw new Error('No filters have been received');

    statsFilter.initial_timestamp = statsFilter.initial_timestamp ? new Date(Date.parse(statsFilter.initial_timestamp)) : MIN_DATE;
    statsFilter.final_timestamp = statsFilter.final_timestamp ? new Date(Date.parse(statsFilter.final_timestamp)) : MAX_DATE;
    statsFilter.min_age = statsFilter.min_age ? statsFilter.min_age : 0;
    statsFilter.max_age = statsFilter.max_age ? statsFilter.max_age : MAX_AGE;
    statsFilter.gender = statsFilter.gender ? statsFilter.gender : null;
    statsFilter.users = statsFilter.users && statsFilter.users.length > 0 ? statsFilter.users : null;

    let websiteHost = [];
    if (statsFilter.websites) {
        statsFilter.websites.forEach(element => {
            let hostname = url.parse(website.url).hostname;
            if (hostname)
                websiteHost.push(url.parse(website.url).hostname);
        });
    }
    statsFilter.websites = websiteHost.length > 0 ? websiteHost : null;
    
    let stats = await repository.getStats(statsFilter);
    if (stats == [])
        return null;

    let response = [];
    stats.forEach(nstat => {
        let currWebsite = {
            id: nstat.WebsiteId,
            url: nstat.Url,
            topic: nstat.Topic
        };

        let currUser = {
            id : nstat.UserId,
            email : nstat.Email,
            gender : nstat.Gender,
            name : nstat.Name,
            date_of_birth : nstat.BirthDate
        };

        let currVisit = {
            id: nstat.VisitId,
            timestamp: nstat.VisitDate,
            user: currUser,
            website: currWebsite
        };

        let currStatistic = response.find(x => x.UserId == currUser.id);
        if (!currStatistic) {
            currStatistic = {
                UserId: currUser.id,
                users_count: 1,
                websites_count: 0,
                visits_count: 0,
                users: [currUser],
                websites: [],
                visits: []
            };

            response.push(currStatistic);
        } 

        if (!currStatistic.websites.find(w => w.id == currWebsite.id)) {
            currStatistic.websites_count += 1;
            currStatistic.websites.push(currWebsite);
        }

        currStatistic.visits_count += 1;
        currStatistic.visits.push(currVisit);
        
    });
    return response;
}