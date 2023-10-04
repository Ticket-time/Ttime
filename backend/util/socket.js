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

        // 일반 예매 취소 
        socket.on("unreserveSeat", async (data) => {
            console.log(data);
            const {bookingId, showId} = data;
            await db.query("delete from seat where bookingId = ?", [bookingId]);
            // cancelTicket    
            truffle_connect.cancelBasicTicket(bookingId);

            let seatData = await makeSeatData(showId, []);
            console.log(seatData);
            
            io.emit("unreservedSeat", seatData);
        });
    });
};

async function makeSeatData(showId, reservedSeats) {
    const [[{seats}]] = await db.query("select seats from shows where showid = ?", [showId]);
    
    let seatId;
  
    let [oldReservedSeats] = await db.query("select seatid from seat where showid = ?", [showId]);
    let isReserved = new Array(seats).fill(false); // 좌석수

    for(let i = 0; i < oldReservedSeats.length; i++) {
        seatId = oldReservedSeats[i].seatid;
        isReserved[seatId - 1] = true;
    }
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