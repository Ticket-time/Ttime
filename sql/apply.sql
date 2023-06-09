create table apply(
    showid int,
    userid varchar(30),
    isWin bool default false,  
    foreign key(showid) references shows(showid),
    foreign key(userid) references user(id)
);