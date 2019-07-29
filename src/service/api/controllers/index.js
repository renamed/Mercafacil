const service = require('../service');

module.exports.addOrUpdateUser = async function(user) {
    try{
        return await service.addOrUpdateUser(user);
    } catch(e){
        console.log(e);
        throwGenericError();
    }
}

module.exports.addOrUpdateWebsite = async function(website) {
    try{
        return await service.addOrUpdateWebsite(website);
    } catch(e){
        console.log(e);
        throwGenericError();
    }
}

module.exports.getUser = async function(user) {
    try {
        return await service.getUser(user);
    } catch(e){
        console.log(e);
        throwGenericError();
    }
}

module.exports.getUserCursor = async function(cursorParams) {
    try {
        return await service.getUserCursor(cursorParams);
    } catch(e){
        console.log(e);
        throwGenericError();
    }
}

module.exports.getWebsite = async function(website) {
    try {
        return await service.getWebsite(website);
    } catch(e){
        console.log(e);
        throwGenericError();
    }
}

module.exports.getWebsiteCursor = async function(cursorParams) {
    try {
        return await service.getWebsiteCursor(cursorParams);
    } catch(e){
        console.log(e);
        throwGenericError();
    }
}

module.exports.recordNewVisit = async function(visitParams){
    try {
        return await service.recordNewVisit(visitParams);
    } catch(e){
        console.log(e);
        throwGenericError();
    } 
}

module.exports.getStatsByTimespan = async function(statsFilters) {
    try {
        return await service.getStatsByTimespan(statsFilters);
    } catch(e){
        console.log(e);
        throwGenericError();
    }
}

module.exports.getStatsByWebsite = async function(statsFilters) {
    try {
        return await service.getStatsByWebsite(statsFilters);
    } catch(e){
        console.log(e);
        throwGenericError();
    }
}

module.exports.getStatsByUser = async function(statsFilters) {
    try {
        return await service.getStatsByUser(statsFilters);
    } catch(e){
        console.log(e);
        throwGenericError();
    }
}


function throwGenericError(){ 
    throw new Error('An internal error has occurred. Please check your inputs parameters or try again later.');
}