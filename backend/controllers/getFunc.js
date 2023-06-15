
var fs = require('fs');
const db = require('./db');

module.exports = {
    getImg : function(showid) {

        // 서버 이미지 주소 디코딩 
        let imgFile = fs.readFileSync(`./image/${showid}.jpg`);
        let encode = Buffer.from(imgFile).toString('base64');
        return encode;
    },

    getRows: function (sql, params, callback) {
        return db.query(sql, params,
            (err, rows) => {
                if(err) {
                    callback(err);
                }
                else 
                    callback(null, rows);
            });
    }

};

