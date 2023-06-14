var fs = require('fs');

function getImg(showid) {
    // 서버 이미지 주소 디코딩 
    let imgFile = fs.readFileSync(`./image/${showid}.gif`);
    let encode = Buffer.from(imgFile).toString('base64');
    console.log(encode);

}

getImg(1);
