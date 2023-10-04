const socketIO = require("socket.io");
const db = require("./database");
const Seat = require("../models/seat");

const truffle_connect = require("../connect.js");

module.exports =  (server) => {
    const io = socketIO(server, {path: "/socket.io"});
    io.on("connection", (socket) => {
        socket.on("reserveSeat", async (data) => {
           const seats = data.seats;
           const {showId, ticketOwner, userId} = data;
            try {
                let bookingId = await truffle_connect.issueBasicTicket(data);
                

                for(let i = 0; i < seats.length; i++){
                    console.log(`${bookingId}, ${showId}, ${seats[i]}`);
                    await db.query(
                        "insert into seat values(?, ?, ?)",
                        [bookingId.toString(), showId, seats[i]]
                    );
                } 

            let seatData = await makeSeatData(showId, seats);
            console.log(seatData);
            io.emit("reservedSeat", seatData);

        } catch(err) {
            console.log(err);
            //io.emit("reservedSeat", []);
            // 에러가 나면 어케 전달을 해야되는지 모르겠음 
        }

        })

        socket.on("unreserveSeat", async (data) => {
            console.log(data);
            Seat.delete(data.showid, data.userid)
            .then(() => {
                console.log("예매 취소 완료");
                Seat.getSeats(data.showid)
                .then(([rows]) => {
                    console.log(rows);
                    io.emit("unreservedSeat", rows);
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        });


    });
};

async function makeSeatData(showId, reservedSeats) {
    const [[{seats}]] = await db.query("select seats from shows where showid = ?", [showId]);
    
    let seatId;
    let isReserved = new Array(seats).fill(false); // 좌석수

    for (let i = 0; i < reservedSeats.length; i++){
        seatId = reservedSeats[i];
        isReserved[seatId - 1] = true;
    }

    let seatData = [];
    for(let i = 0; i < seats; i++) {
        seatData.push({
        location : i + 1,
        state : isReserved[i]
        });
    }
   
    return seatData;
}