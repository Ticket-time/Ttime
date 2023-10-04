
create table apply(
    showid int,
    userid varchar(30),
    seatid int,
    isWin bool default false,  
    foreign key(showid) references shows(showid),
    foreign key(userid) references user(id)
);

기본키 (showid, userid)  // 추첨제 한 공연당 한번만 응모 가능하니까 



