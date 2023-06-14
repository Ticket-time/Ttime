
var fs = require('fs');

module.exports = {
    sayHelloInEnglish: function() {
        return "HELLO";
    },

    getImg : function(showid) {

        // 서버 이미지 주소 디코딩 
        let imgFile = fs.readFileSync(`./image/${showid}.gif`);
        let encode = Buffer.from(imgFile).toString('base64');
        return encode;
    }
};

