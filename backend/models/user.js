const db = require('../util/database');

module.exports = class User {
    constructor(id, password, wallet) {
        this.id = id;
        this.password = password;
        this.wallet = wallet;
    }

    static findId(userid) {
        return db.execute("SELECT * from user where id = ?", [userid]);
    }

    static findPhoneNumber(phoneNumber) {
        return db.execute("SELECT * from user where phoneNumber = ?", [phoneNumber]);
    }

    static create(id, password, wallet, phoneNumber) {
        return db.execute("INSERT INTO user values(?, ?, ?, ?)", [id, password, wallet, phoneNumber]);
    }

    // 응모 정보를 저장 
    static apply(showid, userid) {
        return db.execute("INSERT INTO apply(showid, userid) values(?, ?)", [showid, userid]);
    }

    // 응모 내역 확인 
    static getApplyList(userid){
        return db.execute("SELECT s.showid, s.showname, s.showdate, s.ticketPrice, s.place, s.paystart, s.payend FROM shows s, apply a WHERE s.showid = a.showid and a.userid = ?", [userid]);
    }

    static isApplied(userid, showid) {
        return db.execute("SELECT * FROM apply WHERE userid = ? and showid = ?", [userid, showid]);
    }

    static getApplyInfo(userid, showid) {
        return db.execute("SELECT a.userid, a.showid, isWin, payment, s.paystart, s.payend FROM apply a, shows s where a.showid = s.showid and a.userid= ? and a.showid = ?", [userid, showid]);
    }
    
}
