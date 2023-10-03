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

exports.callNonpayableTicket = function () {
  console.log("기간내 결제되지 않은 티켓에 대해 체크합니다.");
  // 추첨제인 SHOW 공연의 payend 기간이 지난 공연이 있는지.
  // 그 후 apply table에서 payment 0인 내역 체크
  // <- 이 과정에서 트러플과 연결하는 게 중요할 것으로 보인다... userid와 seatid
  // 발급 막기 - 여기 말고 발급 할 때 시간 체크하도록 하면 될듯
  // 해당 내역의 자리는 오너 계정으로 티켓 발급
  // 거래 탭으로 전송!
  Show.findPayendByDate().then(([results]) => {
    if (results.length > 0) {
      results.forEach((instance) => {
        let showId = instance.showid;
        const userIdList = Show.findUnpayment(showId);
        console.log("showId: " + showId + " 결제되지 않은 티켓 체크합니다.");
        // showId, ticketOwner(주인장 오너), numberOfSeats(1로 아마 고정이겠지..), userId,
        // 티켓 발급
        issueTicketByUserId(userIdList);
      });
    }
  });
};

const issueTicketByUserId = function (list, showId) {
  let manager = "0x246d89578e515F63DeCC1CEa8bD1df571aE3a705";
  if (list.length > 0) {
    list.forEach((instance) => {
      let userId = instance.userid;
      truffle_connect.issueTicket(showId, manager, 1, userId, {
        callback,
      });
      // 발급한 티켓 바로 거래탭으로 전송 - bookingId 받아오기 아이고
      truffle_connect.resellTicket(showId, bookingId, userAddr);
    });
  }
};
