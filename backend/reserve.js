const db = require("./util/database");
const Seat = require("./models/seat");

exports.getSeatInfo = async function (showId, callback) {
  const [[{ seats }]] = await db.query(
    "select seats from shows where showid = ?",
    [showId]
  );

  let seatId;
  let [reservedSeats] = await db.query(
    "select seatid from seat where showid = ?",
    [showId]
  );
  let isReserved = new Array(seats).fill(222); // 좌석수

  for (let i = 0; i < reservedSeats.length; i++) {
    seatId = reservedSeats[i].seatid;
    isReserved[seatId - 1] = 111; // status 값
  }

  let seatData = [];
  for (let i = 0; i < seats; i++) {
    seatData.push({
      location: i + 1,
      state: isReserved[i],
    });
  }
  console.log(seatData);
  callback(seatData);
};
