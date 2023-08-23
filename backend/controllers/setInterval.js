const random = require("./random.js");
const Show = require('../models/show');

exports.callRandomFunc = function() {
  console.log("추첨할 공연이 있는지 체크합니다.");
  
  Show.findByDate()
  .then(([results]) => {
    console.log(results);
    if(results.length > 0) {
      results.forEach((instance) => {
        let showid = instance.showid;
        console.log(showid + " 추첨 시작합니다.");
        random.random(showid);
      });
    }
  })
  .catch(err => console.log(err));
}
