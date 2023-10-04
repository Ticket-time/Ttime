const random = require("./random.js");
const Show = require("../models/show");
const truffle_connect = require("../connect.js");

exports.callRandomFunc = function () {
  console.log("추첨할 공연이 있는지 체크합니다.");

  Show.findByDate()
    .then(([results]) => {
      console.log(results);
      if (results.length > 0) {
        results.forEach((instance) => {
          let showid = instance.showid;
          console.log("showId: " + showid + " 추첨 시작합니다.");
          random.random(showid);
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.callUnpaidTicket = async function () {
  console.log("기간내 결제되지 않은 티켓에 대해 체크합니다.");

  Show.findPayendByDate().then(([results]) => {
    if (results.length > 0) {
      results.forEach((instance) => {
        let showId = instance.showid;
        console.log("showId: " + showId + " 결제되지 않은 티켓 체크합니다.");
        Show.findUnpayment(showId).then(([userIdList]) => {
          console.log(userIdList);
          issueTicketByUserId(userIdList, showId);
        });
      });
    }
  });
};

const issueTicketByUserId = function (list, showId) {
  console.log("티켓 발급, 거래 탭 전송");
  let manager = "0x246d89578e515F63DeCC1CEa8bD1df571aE3a705";
  if (list.length > 0) {
    list.forEach((instance) => {
      let userId = instance.userid;
      truffle_connect.issueTicket(showId, manager, 1, userId, function (info) {
        let bookingId = info.data.bookingId;
        truffle_connect.resellTicket(showId, bookingId, manager, function () {
          console.log("거래 탭 전송 완료");
        });
      });
    });
  }
};
