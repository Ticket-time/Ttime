const db = require('../util/database');

module.exports = class Seat {
    
    //static fetchAll()

    static create(arr) {
        console.log("models");
        console.log(arr);
        return db.query(
            "INSERT INTO seat (showid, areaid, userid, x, y) VALUES ?",
            [arr]
        );
    }

    static getSeats(showid) {
        return db.execute("SELECT * FROM seat WHERE showid = ?", [showid]);
    }

    static delete(showid, userid) {
        return db.execute("DELETE FROM seat WHERE showid = ? and  userid = ?", [showid, userid]);
    }
}