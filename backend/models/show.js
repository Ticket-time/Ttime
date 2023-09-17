const db = require('../util/database');

module.exports = class Show {
    constructor(id, name, date, time, place, ticketPrice, imagePath) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.time = time;
        this.place = place;
        this.ticketPrice = ticketPrice;
        this.imagePath = imagePath;
    }

    // 전체 공연 불러오기 + 검색한 공연 불러오기 (현재 진행중인)
    static fetchAll() {
        return db.execute("SELECT * FROM shows where showdate > sysdate()"); 
    }

    static fetchOneTypeShow(type) {
        return db.execute("SELECT * FROM shows WHERE isLottery = ?", [type]);
    }

    // 공연 세부 정보 가져오기 
    static findById(id) {
        return db.execute("SELECT * FROM shows WHERE showid = ?", [id]);
    }

    static findByName(name) {
        let query = "%" + name + "%";
        return db.execute(`SELECT * FROM shows WHERE showname LIKE ?`, [query]);
    }

    static findByDate() {
        // 추첨 시간: 응모 종료일 + 1 DAY
        return db.execute("SELECT showid FROM shows WHERE curdate() = DATE(DATE_ADD(applyend, INTERVAL 1 DAY))");
    }

}
