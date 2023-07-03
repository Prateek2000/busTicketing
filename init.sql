create table if not exists apiusers(
apiuser varchar(100) primary key not null,
passhash text not null,
admin varchar(1) not null
);

create table if not exists users(
userid int primary key not null,
username varchar(100) not null,
contact varchar(100) not null,
age int not null
);

create sequence seq_user_index owned by users.userid;

create table if not exists ticket(
seat int primary key not null,
userid int references users(userid)
);

insert into ticket values(1, NULL);
insert into ticket values(2, NULL);
insert into ticket values(3, NULL);
insert into ticket values(4, NULL);
insert into ticket values(5, NULL);
insert into ticket values(6, NULL);
insert into ticket values(7, NULL);
insert into ticket values(8, NULL);
insert into ticket values(9, NULL);
insert into ticket values(10, NULL);
insert into ticket values(11, NULL);
insert into ticket values(12, NULL);
insert into ticket values(13, NULL);
insert into ticket values(14, NULL);
insert into ticket values(15, NULL);
insert into ticket values(16, NULL);
insert into ticket values(17, NULL);
insert into ticket values(18, NULL);
insert into ticket values(19, NULL);
insert into ticket values(20, NULL);
insert into ticket values(21, NULL);
insert into ticket values(22, NULL);
insert into ticket values(23, NULL);
insert into ticket values(24, NULL);
insert into ticket values(25, NULL);
insert into ticket values(26, NULL);
insert into ticket values(27, NULL);
insert into ticket values(28, NULL);
insert into ticket values(29, NULL);
insert into ticket values(30, NULL);
insert into ticket values(31, NULL);
insert into ticket values(32, NULL);
insert into ticket values(33, NULL);
insert into ticket values(34, NULL);
insert into ticket values(35, NULL);
insert into ticket values(36, NULL);
insert into ticket values(37, NULL);
insert into ticket values(38, NULL);
insert into ticket values(39, NULL);
insert into ticket values(40, NULL);

