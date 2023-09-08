const db = require('../util/database');

module.exports = class Search {
    constructor(word, date) {
        this.word = word;
        this.date = date;
    }

    // 사용자가 검색한 단어 추가
    static insert(word, date) {
        // ! 공백 제외 구현 
        return db.execute("INSERT INTO search VALUES (?, ?)", [word, date]);
    }

    // 랭킹 재조정 전에 이전 data 삭제
    static delete(date) {
        // 현재 날짜를 주면 day를 1 뺀 날짜보다 작은거는 다 삭제 
        date.setDate(date.getDate() - 1);
        console.log('models search' + date);
        return db.execute("DELETE FROM search WHERE date < ?", [date]);
    }

    // 랭킹 다시 조정 
    static setRank() {
        return db.execute("SELECT word FROM search GROUP BY word ORDER BY COUNT(*) DESC LIMIT 10");
    }
   
}
