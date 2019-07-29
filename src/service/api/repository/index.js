const mariadb = require('mariadb');

const pool = mariadb.createPool({
     host: process.env.DATABASE_HOST, 
     user:'mercafacil', 
     password: 'senhasecreta123',
     database: 'db_mercafacil',
    connectionLimit: 20
});

module.exports.getDbConnection = async function() {
    return await pool.getConnection();
};

module.exports.upsertUser = async function(user) {
    let connection = false;
    try {
        connection = await this.getDbConnection();
        let sql = `CALL sp_user_ins(?, ?, ?, ?)`;
        let result = await connection.query(sql, [user.email, user.name, user.gender, user.date_of_birth]);
        return result[0][0].UserId;
    } finally {
        if (connection)
            await connection.end();
    }
}

module.exports.upsertWebsite = async function(website) {
    let connection = false;
    try {
        connection = await this.getDbConnection();
        let sql = `CALL sp_website_ins(?, ?, ?)`;
        let result = await connection.query(sql, [website.url, website.hostname, website.topic]);
        return result[0][0].WebsiteId;
    } finally {
        if (connection)
            await connection.end();
    }
}

module.exports.getUser = async function(user) {
    let connection = false;
    try {
        connection = await this.getDbConnection();
        let sql = `CALL sp_user_sel(?, ?)`;
        let result = await connection.query(sql, [user.email, user.id]);
        return result[0][0];
    } finally {
        if (connection)
            await connection.end();
    }
} 

module.exports.getWebsite = async function(website) {
    let connection = false;
    try {
        connection = await this.getDbConnection();
        let sql = `CALL sp_website_sel(?, ?)`;
        let result = await connection.query(sql, [website.hostname, website.id]);
        return result[0][0];
    } finally {
        if (connection)
            await connection.end();
    }
} 

module.exports.getUserCursor = async function(cursorParams) {
    let connection = false;
    try {
        connection = await this.getDbConnection();
        let sql = `CALL sp_user_sel_cursor(?, ?, ?, ?)`;
        let result = await connection.query(sql, [cursorParams.limit, cursorParams.skip, cursorParams.sort_field, cursorParams.sort_order]);
        let cursor = result[0];
        delete cursor.meta;
        return cursor;
    } finally {
        if (connection)
            await connection.end();
    }
}

module.exports.getWebsiteCursor = async function(cursorParams) {
    let connection = false;
    try {
        connection = await this.getDbConnection();
        let sql = `CALL sp_website_sel_cursor(?, ?, ?, ?)`;
        let result = await connection.query(sql, [cursorParams.limit, cursorParams.skip, cursorParams.sort_field, cursorParams.sort_order]);
        let cursor = result[0];
        delete cursor.meta;
        return cursor;
    } finally {
        if (connection)
            await connection.end();
    }
}

module.exports.recordNewVisit = async function(visit){
    let connection = false;
    try {
        connection = await this.getDbConnection();
        let sql = `CALL sp_visit_ins(?, ?, ?)`;        
        let result = await connection.query(sql, [visit.userId, visit.websiteId, visit.timestamp]);
        return result[0][0];
    } finally {
        if (connection)
            await connection.end();
    }
}

module.exports.getStats = async function(statsFilter){
    let connection = false;
    try {
        connection = await this.getDbConnection();
        let sql = `CALL sp_stats_sel(?, ?, ?, ?, ?, ?, ?)`;        
        let result = await connection.query(sql, [statsFilter.initial_timestamp, 
                                                    statsFilter.final_timestamp,
                                                    statsFilter.min_age,
                                                    statsFilter.max_age,
                                                    statsFilter.gender,
                                                    statsFilter.users,
                                                    statsFilter.websites]);
        let cursor = result[0];
        delete cursor.meta;
        return cursor;
    } finally {
        if (connection)
            await connection.end();
    }
}