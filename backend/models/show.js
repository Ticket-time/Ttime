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
        return db.execute("SELECT * FROM shows");
    }

    // 공연 세부 정보 가져오기 
    static findById(id) {
        return db.execute("SELECT * FROM shows WHERE showid = ?", [id]);
    }

    static findByName(name) {
        let query = "%" + name + "%";
        console.log(query);
        return db.execute(`SELECT * FROM shows WHERE showname LIKE ?`, [query]);
    }

    

}
