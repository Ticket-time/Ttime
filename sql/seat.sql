create table seat(
    bookingid int,
    showid int,
    seatid int,

    constraint seat_pk primary key(bookingid, showid, seatid),
    foreign key(showid) references shows(showid)
);

기본키 수정하기 (showid, seatid)

1. 좌석 정보를 확인하는 것 
    bookingId => showid, userid => seat table where

2. 추첨제 결제 정보를 확인하는 것 
    userid, showid => select seat == 1 ?