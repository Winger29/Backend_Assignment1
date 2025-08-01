

---Senior Table---
CREATE TABLE Seniors (
seniorId varchar(10) PRIMARY KEY,
fullName VARCHAR(100) NOT NULL,
email varchar(100) not null,
password varchar(255) not null,
dob DATE,
interests TEXT,
profileImage VARCHAR(255),
createdAt DATETIME Default GETDATE(),
);

DECLARE @nextSeniorId VARCHAR(10);

-- Generate next ID like S001, S002, ...
SELECT @nextSeniorId = 'S' + RIGHT('000' + CAST(ISNULL(MAX(CAST(SUBSTRING(seniorId, 2, LEN(seniorId)) AS INT)), 0) + 1 AS VARCHAR), 3)
FROM Seniors;

-- Insert a new senior with generated ID
INSERT INTO Seniors (seniorId, fullName, email, password, dob, interests, profileImage)
VALUES (
    @nextSeniorId, 
    'John Tan', 
    'john.tan@example.com', 
    '$2b$10$A9T4hksU8p6LqYQcTfYmuOiYByF.3Z/AbL0EVO2ZjZNH2UakX5v6q', -- fake bcrypt
    '1951-02-10', 
    'Walking, Chess', 
    'john.jpg'
);

-- Batch insert with fake bcrypt-hashed passwords
INSERT INTO Seniors (seniorId, fullName, email, password, dob, interests, profileImage)
VALUES 
('S002','Alice Tan', 'alice.tan@example.com', '$2b$10$hJ35uO2TnhI3uR/Sz59qxOqKiUYHZ8Y2uMbKeRmJzjsOTGiVLZm7O', '1950-08-12', 'Gardening, Walking, Reading', 'alice.jpg'),
('S003','David Lim', 'david.lim@example.com', '$2b$10$FjdL1sPf6HxUCyE/EZlJCu8JDNPtwSJiFbPdQeZQj.6dE1RIAr4Z6', '1945-04-22', 'Chess, Tai Chi, Cooking', 'david.png'),
('S004','Maria Ong', 'maria.ong@example.com', '$2b$10$n7Eo/Uv14Q06c.CsfWdoeuvTkMYGMDeSTmXkRWGP1K2opzpssy7LG', '1952-11-03', 'Knitting, Singing, Puzzles', 'maria.jpg'),
('S005','James Goh', 'james.goh@example.com', '$2b$10$3MYh5TAg4coGxCqtEjF5ROz9H0bVdtS4DLPFh7LO5lZ6NyXc5HfGa', '1943-03-10', 'Birdwatching, Sudoku, Walking', 'james.jpg'),
('S006','Lucy Tan', 'lucy.tan@example.com', '$2b$10$zKnK3OSZJvLz5JQ5Tn/WYuwB3yJZhoJJ3Tmy3gaep97Siy3U.MA6S', '1948-07-15', 'Painting, Singing, Dancing', 'lucy.jpg'),
('S007','Peter Yeo', 'peter.yeo@example.com', '$2b$10$xu0k1bnOm9ZFKHz8wleIFODNcExN97gx3L6OzAiZkhXJuJOnvHpqC', '1950-01-25', 'Fishing, Tai Chi, Calligraphy', 'peter.jpg'),
('S008','Agnes Lee', 'agnes.lee@example.com', '$2b$10$E2UvYe0wl/o3B29N9J7EjOhD.HwUTBOvCd6Gi9deNcQxux0L0w1Ae', '1953-06-30', 'Reading, Gardening, Yoga', 'agnes.jpg'),
('S009','Mohamed Salleh', 'mohamed.salleh@example.com', '$2b$10$eW75PUx0JPqkJvfeXGeKd.q3cInZFEHPhA7ipz0w8P5RvKeBDwHpO', '1946-11-17', 'Chess, Cooking, Movies', 'mohamed.jpg'),
('S010','Helen Choo', 'helen.choo@example.com', '$2b$10$7Fi9IByRL2kD.6hrzX9VVeD7O6xRbkfZ38NwGZCHyEwLkPBBAk5jC', '1944-12-05', 'Knitting, Singing, Cooking', 'helen.jpg'),
('S011','Betty Koh', 'betty.koh@example.com', '$2b$10$N6K1xZAXjs9YVqmh7LqGE.9UgCVZqx5g4l5j65bQh6LHZjSEWyqaW', '1949-05-09', 'Yoga, Tai Chi', 'betty.jpg'),
('S012','Ronald Lee', 'ronald.lee@example.com', '$2b$10$KmREaGi6JdTz2y4PAUMOeOe8r0roN9cRYc4.8RVAmHqg1WEXvBI8G', '1952-03-15', 'Reading, Gardening', 'ronald.jpg'),
('S013','Jenny Sim', 'jenny.sim@example.com', '$2b$10$Tu/7Znxs6qJ1mPBXbozueuI1IdjWaF7D8N/Nm3A2gop.2sM6GEclS', '1947-08-30', 'Cooking, Singing', 'jenny.jpg'),
('S014','Victor Goh', 'victor.goh@example.com', '$2b$10$Bl2v9Hd1dC7t1BR0zxayq.TAv2J/X8iC6fNbc9WI30kCwLwOgwRAe', '1946-06-17', 'Walking, Chess', 'victor.jpg'),
('S015','Grace Tan', 'grace.tan@example.com', '$2b$10$0s8LZ9QbkSyLlnkYHfzoE.BXssCtIYYLgUJu1I6EF4zvF3C4ZdG9O', '1950-01-05', 'Knitting, Reading', 'grace.jpg');

--- Clinic Table ---
CREATE TABLE Clinic (
    clinicId VARCHAR(10) PRIMARY KEY,      -- e.g., C001
    clinicName VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    createdAt DATETIME DEFAULT GETDATE()
);

INSERT INTO Clinic (clinicId, clinicName, location, phone, email)
VALUES 
('C001','Evergreen Seniors Health','77 Green Ave, Singapore 778899','6555 1234','contact@evergreensg.sg'),
('C002', 'Silver Wellness Centre', '20 Jubilee St, Singapore 456123', '6100 1010', 'hello@silverwellness.sg'),
('C003', 'Care4Seniors Medical', '99 Tranquil Rd, Singapore 789654', '6333 2222', 'info@care4seniors.sg'),
('C004', 'Sunrise Health Centre', '12 Sunrise Walk, Singapore 778200', '6888 1122', 'info@sunrisehc.sg'),
('C005', 'Golden Oak Family Clinic', '55 Elder Grove, Singapore 665500', '6222 3344', 'contact@goldenoak.sg'),
('C006', 'Serenity Seniors Clinic', '34 Tranquil Way, Singapore 600123', '6999 7788', 'hello@serenity.sg'),
('C007', 'Harmony Medical Centre', '20 Peace Lane, Singapore 700456', '6111 9000', 'admin@harmonyclinic.sg'),
('C008', 'SilverBridge Medical Hub', '90 Link Rd, Singapore 701222', '6234 5678', 'support@silverbridge.sg'),
('C009', 'Active Aging Care', '88 Wellness Blvd, Singapore 720000', '6444 1122', 'info@activeaging.sg'),
('C010', 'ElderCare Plus Clinic', '15 Comfort Ave, Singapore 765432', '6333 2100', 'admin@eldercareplus.sg'),
('C011','Gentle Care Clinic','12 Bliss St, Singapore 777001','6000 1234','contact@gentlecare.sg'),
('C012','Senior Smiles Health','80 Hope Lane, Singapore 788002','6555 9090','hello@seniorsmiles.sg');

--- ClinicStaff Table ---
CREATE TABLE ClinicStaff (
    staffId VARCHAR(10) PRIMARY KEY,         -- e.g., CS001
    fullName VARCHAR(100),
    clinicId VARCHAR(10),
    position VARCHAR(50),
    isRegistered BIT DEFAULT 0,
    FOREIGN KEY (clinicId) REFERENCES Clinic(clinicId)
);

INSERT INTO ClinicStaff (staffId, fullName, clinicId, position, isRegistered)
VALUES
('CS001', 'Rachel Tan', 'C001', 'Senior Nurse', 1),
('CS002', 'Alan Koh', 'C002', 'Staff Nurse', 1),
('CS003', 'Lily Ng', 'C002', 'Receptionist', 1),
('CS004', 'Melissa Teo', 'C003', 'Medical Officer', 1),
('CS005', 'Grace Lee', 'C001', 'Receptionist', 1),
('CS006', 'Noor Hamzah', 'C002', 'Clinic Assistant', 1),
('CS007', 'Brandon Tan', 'C003', 'Junior Nurse', 1),
('CS008', 'Irene Chua', 'C001', 'Staff Nurse', 1),
('CS009', 'Daniel Soh', 'C003', 'Lab Technician', 0),
('CS010', 'Olivia Toh', 'C002', 'Enrolled Nurse', 0),
('CS011', 'Tommy Ng', 'C001', 'Receptionist', 1),
('CS012', 'Wendy Chua', 'C003', 'Senior Nurse', 1),
('CS013', 'Jasmine Ong', 'C004', 'Staff Nurse', 1),
('CS014', 'Ben Toh', 'C002', 'Medical Assistant', 0),
('CS015', 'Emily Tan', 'C005', 'Junior Nurse', 1);

--- StaffAccount Table ---
CREATE TABLE StaffAccounts (
    staffId VARCHAR(10) PRIMARY KEY,         -- Same CSnnn format
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profileImage VARCHAR(255),
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (staffId) REFERENCES ClinicStaff(staffId)
);

INSERT INTO StaffAccounts (staffId, email, password, profileImage)
VALUES
('CS001', 'rachel.tan@sunshine.sg', '$2b$10$VmB4w3DbYvQJ0Ex63uYXDu8Ov/qFzB2tJmtFZ/Nt8aSkmPa6LGJqC', 'rachel.jpg'),
('CS002', 'alan.koh@silverwellness.sg', '$2b$10$C0BqwSnY1RfeRtaGZVCt.eYEVbGmpzKMciA9uP9znHWRgoVETB9vW', 'alan.jpg'),
('CS003', 'lily.ng@silverwellness.sg', '$2b$10$Oyfy7LsDJKdtrz.PPOagcuPEeVRM78H0bsft0UISTuAuJZznKuwHa', 'lily.jpg'),
('CS004', 'melissa.teo@care4seniors.sg', '$2b$10$K4nH0bk9vWQ1Mi3RB60AheMJ/MwF6T8O61Cu/TTQybZ37ovAH8Eq6', 'melissa.jpg'),
('CS005', 'grace.lee@sunshine.sg', '$2b$10$7IdLVFl/Fx2ZVFAjzQW1POAxPBTdfSTOK/VgWJmlV4Ms84JqpWKeq', 'grace.jpg'),
('CS006', 'noor.hamzah@silverwellness.sg', '$2b$10$NxS8QMSfRZahp8pQ6KnySeRjFhGeDmdwB2YhXZT7U9VXOvJPvx6ze', 'noor.jpg'),
('CS007', 'brandon.tan@care4seniors.sg', '$2b$10$6yP6OYxoZbnJeY7XRx6G7uVWRZ7s7NVdZT6EjAWUebmf7FnR3VmXm', 'brandon.jpg'),
('CS008', 'irene.chua@sunshine.sg', '$2b$10$BiB5omPIli0hx/sEYdRgcu5.v4k4YmJ4mdnWaNq12YH3UQOHZc1V6', 'irene.jpg'),
('CS011', 'tommy.ng@evergreen.sg', '$2b$10$9hxPiELDUuz6MH9mXnJvMOLmJGrMBYqFXtf0MREO7EL7oR6f4zZuq', 'tommy.jpg'),
('CS012', 'wendy.chua@care4seniors.sg', '$2b$10$ZlAqPiwH73GvSTmyvPvx2OxCmbUIUv29MRZxuAyCSg9G4tMA3WYDO', 'wendy.jpg'),
('CS013', 'jasmine.ong@sunrisehc.sg', '$2b$10$DcoRhEkZNVqgUnZKbI7H/.yPPNeiBLDnNzqM1tZCZnNqE6Me2sqQe', 'jasmine.jpg'),
('CS015', 'emily.tan@goldenoak.sg', '$2b$10$cvzjJlm1d7jD1GblzxJ7zePYmCu9EvZOPuCOijv2.0yrrrsIzPyPm', 'emily.jpg');

--- Doctor Table ---
CREATE TABLE Doctor (
    doctorId VARCHAR(10) PRIMARY KEY,         -- e.g., D001
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    doctorType VARCHAR(50),                   -- e.g., GP, Specialist
    profileImage VARCHAR(255),                -- Optional image URL
    createdAt DATETIME DEFAULT GETDATE()
);

INSERT INTO Doctor (doctorId, name, email, doctorType, profileImage)
VALUES 
('D001','Dr. Kenneth Wong','kenneth.wong@evergreen.sg','Orthopedic','kenneth.jpg'),
('D002', 'Dr. Marcus Tan', 'marcus.tan@goldenage.sg', 'Cardiologist', 'marcus.jpg'),
('D003', 'Dr. Rachel Lee', 'rachel.lee@healthylife.org', 'Geriatrician', 'rachel.jpg'),
('D004', 'Dr. Vanessa Lim', 'vanessa.lim@silvercare.sg', 'Dermatologist', 'vanessa.jpg'),
('D005', 'Dr. Daniel Chia', 'daniel.chia@activehealth.sg', 'Endocrinologist', 'daniel.jpg'),
('D006', 'Dr. Noor Rahman', 'noor.rahman@medilink.sg', 'Neurologist', 'noor.jpg'),
('D007', 'Dr. Melissa Teo', 'melissa.teo@lifelong.sg', 'Family Physician', 'melissa.jpg'),
('D008', 'Dr. Kelvin Chan', 'kelvin.chan@healthplus.sg', 'Ophthalmologist', 'kelvin.jpg'),
('D009', 'Dr. Priya Nair', 'priya.nair@seniorcare.sg', 'Geriatrician', 'priya.jpg'),
('D010', 'Dr. David Tan', 'david.tan@heartwell.sg', 'Cardiologist', 'david.jpg'),
('D011','Dr. Sarah Lim','sarah.lim@gentlecare.sg','Geriatrician','sarah.jpg'),
('D012','Dr. Aaron Yeo','aaron.yeo@healthylife.org','General Practitioner','aaron.jpg'),
('D013','Dr. Clara Tan','clara.tan@care4seniors.sg','Orthopedic','clara.jpg');

--- Doctor and Clinc Table ---
CREATE TABLE DoctorClinic (
    doctorId VARCHAR(10),
    clinicId VARCHAR(10),
    availableDay VARCHAR(20),                 -- e.g., Monday, Tuesday
    availableTime TIME(0),                       -- e.g., 09:00
    
    PRIMARY KEY (doctorId, clinicId, availableDay, availableTime),
    FOREIGN KEY (doctorId) REFERENCES Doctor(doctorId),
    FOREIGN KEY (clinicId) REFERENCES Clinic(clinicId)
);

INSERT INTO DoctorClinic (doctorId, clinicId, availableDay, availableTime)
VALUES 
('D001', 'C001', 'Monday', '09:00'),
('D002', 'C002', 'Tuesday', '10:00'),
('D003', 'C003', 'Wednesday', '11:00'),
('D004', 'C002', 'Thursday', '14:00'),
('D005', 'C001', 'Friday', '13:30'),
('D006', 'C003', 'Monday', '08:30'),
('D007', 'C001', 'Wednesday', '10:00'),
('D008', 'C002', 'Friday', '09:30'),
('D009', 'C003', 'Thursday', '15:00'),
('D010', 'C001', 'Tuesday', '11:00'),
('D011', 'C011', 'Tuesday', '09:00'),
('D011', 'C012', 'Thursday', '10:00'),
('D012', 'C001', 'Friday', '10:30'),
('D013', 'C005', 'Monday', '14:00');

--- Booking Table ---
CREATE TABLE Booking (
    clinicId VARCHAR(10),                 -- FK
    bookingDate DATE NOT NULL,           -- part of PK
    bookingSeq INT NOT NULL,             -- resets daily
    appointmentTime TIME(0) NOT NULL,
    doctorId VARCHAR(10),
    userId VARCHAR(10),
    phone VARCHAR(20),
    type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    createdAt DATETIME DEFAULT GETDATE(),

    PRIMARY KEY (clinicId, bookingDate, bookingSeq),
    FOREIGN KEY (clinicId) REFERENCES Clinic(clinicId),
    FOREIGN KEY (doctorId) REFERENCES Doctor(doctorId),
    FOREIGN KEY (userId) REFERENCES Seniors(seniorId)
);

select * from seniors
select * from clinic
select * from ClinicStaff
select * from StaffAccounts
select * from doctor
select * from doctorclinic
select * from Booking

-- Kaiwen's tables --
create table GroupChat (
groupID int not null identity(1,1) primary key,
groupName varchar(50) not null,
groupDesc varchar(255) null,
dateCreated datetime default current_timestamp not null, 
groupInterest varchar(255) not null
);

INSERT INTO GroupChat (groupName, groupDesc, groupInterest)
VALUES 
('Tech Talk', 'Discuss latest in tech and gadgets', 'Technology'),
('Bookworms', 'For people who love reading novels and literature', 'Reading'),
('Fit Friends', 'Fitness and health enthusiasts unite!', 'Fitness'),
('Gamers United', 'PC, console, mobile gamers welcome!', 'Gaming'),
('Art Space', 'Share and discuss your art projects', 'Art'),
('Startup Hub', 'Entrepreneurs and startup founders discussion space', 'Entrepreneurship'),
('Travel Tribe', 'Sharing travel tips and experiences', 'Travel'),
('Code Cafe', 'Coding, programming, and dev hangout', 'Programming'),
('Music Vibes', 'Discover and share music', 'Music'),
('Movie Buffs', 'All things movies and TV shows', 'Movies');

select groupName,groupDesc,groupInterest from GroupChat
use backend_db;
select * from GroupChat


-- for members of each group chat with roles defined 
create table GroupMember(
memID int not null identity (1,1) primary key,
groupID int not null,
userID varchar(10) not null,
roles varchar(10) check (roles in ('owner','member')) default 'member' not null,
joinDate datetime default current_timestamp not null,
constraint fk_groupID foreign key(groupID) references GroupChat(groupID),
constraint fk_userID foreign key(userID) references Seniors(seniorId)
);

insert into GroupMember (groupID, userID, roles) values (5, 'S002', 'owner')

INSERT INTO GroupMember (groupID, userID, roles)
VALUES 
(3, 'S001', 'owner'),
(7, 'S002', 'member'),
(1, 'S003', 'member'),
(5, 'S004', 'owner'),
(9, 'S005', 'member'),
(2, 'S006', 'member'),
(8, 'S007', 'owner'),
(4, 'S008', 'member'),
(6, 'S009', 'member'),
(10, 'S010', 'owner'),
(1, 'S001', 'member'),
(2, 'S002', 'owner'),
(5, 'S003', 'member'),
(6, 'S004', 'member'),
(3, 'S005', 'owner'),
(9, 'S006', 'member'),
(4, 'S007', 'member'),
(7, 'S008', 'owner'),
(10, 'S009', 'member'),
(8, 'S010', 'member');



select * from GroupMember

-- query for obtaining the groupchat the user has joined 
select groupName,groupDesc,groupInterest from GroupChat inner join GroupMember on GroupChat.groupID = GroupMember.groupID inner join Seniors on Seniors.seniorId = GroupMember.userID where userID = 'S010'


-- for the messages that would be posted in groupchats
create table groupmessages(
userid varchar(10) not null,
groupid int not null,
message varchar(255) not null,
msgtime datetime not null,
constraint fk_groupid4msg foreign key(groupid) references Groupchat(groupid),
constraint fk_userid4msg foreign key(userid) references Seniors(seniorId)
);

INSERT INTO groupmessages (groupid, userid, message, msgtime) VALUES
(3, 'S001', 'Hello everyone!', DATEADD(MINUTE, -3900, GETDATE())),
(7, 'S002', 'Hi all, how are you?', DATEADD(MINUTE, -3850, GETDATE())),
(1, 'S003', 'Looking forward to the meeting.', DATEADD(MINUTE, -3800, GETDATE())),
(5, 'S004', 'Good morning!', DATEADD(MINUTE, -3750, GETDATE())),
(9, 'S005', 'Can someone help me with this?', DATEADD(MINUTE, -3700, GETDATE())),
(2, 'S006', 'I will join the call.', DATEADD(MINUTE, -3650, GETDATE())),
(8, 'S007', 'Thanks for the update.', DATEADD(MINUTE, -3600, GETDATE())),
(4, 'S008', 'Noted with thanks.', DATEADD(MINUTE, -3550, GETDATE())),
(6, 'S009', 'Any plans for the weekend?', DATEADD(MINUTE, -3500, GETDATE())),
(10, 'S010', 'Please review the document.', DATEADD(MINUTE, -3450, GETDATE())),
(1, 'S001', 'I agree with the plan.', DATEADD(MINUTE, -3400, GETDATE())),
(2, 'S002', 'Let’s catch up later.', DATEADD(MINUTE, -3350, GETDATE())),
(5, 'S003', 'Will do.', DATEADD(MINUTE, -3300, GETDATE())),
(6, 'S004', 'Thanks!', DATEADD(MINUTE, -3250, GETDATE())),
(3, 'S005', 'Can you send the files?', DATEADD(MINUTE, -3200, GETDATE())),
(9, 'S006', 'On it.', DATEADD(MINUTE, -3150, GETDATE())),
(4, 'S007', 'I’m available.', DATEADD(MINUTE, -3100, GETDATE())),
(7, 'S008', 'Great job everyone.', DATEADD(MINUTE, -3050, GETDATE())),
(10, 'S009', 'Meeting rescheduled.', DATEADD(MINUTE, -3000, GETDATE())),
(8, 'S010', 'Noted.', DATEADD(MINUTE, -2950, GETDATE())),
(3, 'S001', 'Reminder: submit your reports.', DATEADD(MINUTE, -2900, GETDATE())),
(7, 'S002', 'Thanks for the reminder.', DATEADD(MINUTE, -2850, GETDATE())),
(1, 'S003', 'Will submit by today.', DATEADD(MINUTE, -2800, GETDATE())),
(5, 'S004', 'Received.', DATEADD(MINUTE, -2750, GETDATE())),
(9, 'S005', 'Working on it.', DATEADD(MINUTE, -2700, GETDATE())),
(2, 'S006', 'Almost done.', DATEADD(MINUTE, -2650, GETDATE())),
(8, 'S007', 'Keep it up.', DATEADD(MINUTE, -2600, GETDATE())),
(4, 'S008', 'Thanks team!', DATEADD(MINUTE, -2550, GETDATE())),
(6, 'S009', 'Will update soon.', DATEADD(MINUTE, -2500, GETDATE())),
(10, 'S010', 'Sounds good.', DATEADD(MINUTE, -2450, GETDATE())),
(1, 'S001', 'Any blockers?', DATEADD(MINUTE, -2400, GETDATE())),
(2, 'S002', 'No blockers here.', DATEADD(MINUTE, -2350, GETDATE())),
(5, 'S003', 'All good.', DATEADD(MINUTE, -2300, GETDATE())),
(6, 'S004', 'No issues.', DATEADD(MINUTE, -2250, GETDATE())),
(3, 'S005', 'Let me check.', DATEADD(MINUTE, -2200, GETDATE())),
(9, 'S006', 'Will report back.', DATEADD(MINUTE, -2150, GETDATE())),
(4, 'S007', 'Thanks!', DATEADD(MINUTE, -2100, GETDATE())),
(7, 'S008', 'Meeting in 10 minutes.', DATEADD(MINUTE, -2050, GETDATE())),
(10, 'S009', 'Joining now.', DATEADD(MINUTE, -2000, GETDATE())),
(8, 'S010', 'Ready.', DATEADD(MINUTE, -1950, GETDATE())),
(6, 'S009', 'Will update soon.', DATEADD(MINUTE, -2500, GETDATE())),
(10, 'S010', 'Sounds good.', DATEADD(MINUTE, -2450, GETDATE())),
(1, 'S001', 'Any blockers?', DATEADD(MINUTE, -2400, GETDATE())),
(2, 'S002', 'No blockers here.', DATEADD(MINUTE, -2350, GETDATE())),
(5, 'S003', 'All good.', DATEADD(MINUTE, -2300, GETDATE())),
(6, 'S004', 'No issues.', DATEADD(MINUTE, -2250, GETDATE()));

select * from Seniors;
select * from GroupChat where groupName = 'test';
select * from GroupChat; 
select * from GroupMember;
select * from groupmessages;


select Seniors.fullName, groupmessages.message, groupmessages.msgtime from groupmessages inner join Seniors on Seniors.seniorId = groupmessages.userid where groupid = 3 order by groupmessages.msgtime;

create table groupmessages(
msgid int not null identity (1,1) primary key,
userid varchar(10) not null,
groupid int not null,
message varchar(255) not null,
msgtime datetime not null,
constraint fk_groupid4msg foreign key(groupid) references Groupchat(groupid),
constraint fk_userid4msg foreign key(userid) references Seniors(seniorId)
);

-- fang yu xuan's tables 
CREATE TABLE Organisers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    organiserId AS (CAST('O' + RIGHT('000' + CONVERT(VARCHAR, id), 3) AS VARCHAR(10))) PERSISTED UNIQUE,
    fullName VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    contactNumber VARCHAR(15)
);

INSERT INTO Organisers (fullName, email, password, contactNumber)
VALUES
('Emily Wong', 'emily.wong@example.com', 'hashedpw1', '91234567'),
('Michael Tan', 'michael.tan@example.com', 'hashedpw2', '98765432'),
('Sarah Lim', 'sarah.lim@example.com', 'hashedpw3', '87654321');

drop table organisers


CREATE TABLE Events (
    eventId INT IDENTITY(1,1) PRIMARY KEY,
    organiserId VARCHAR(10) NOT NULL,
    title VARCHAR(100) NOT NULL,
    eventDate DATE NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    location VARCHAR(100),
    FOREIGN KEY (organiserId) REFERENCES Organisers(organiserId)
);

INSERT INTO Events (organiserId, title, eventDate, startTime, endTime, location)
VALUES
('O001', 'Health Talk: Nutrition for Seniors', '2025-07-21', '10:00', '12:00', 'Community Hall A'),
('O001', 'Chair Yoga for Seniors', '2025-07-25', '09:30', '11:00', 'Fitness Room, Block 123'),
('O002', 'Memory Games & Tea', '2025-07-28', '14:00', '16:00', 'ElderConnect Activity Centre'),
('O003', 'Gardening Workshop', '2025-08-02', '08:00', '10:30', 'Golden Years Garden'),
('O003', 'Digital Skills: Intro to WhatsApp', '2025-08-05', '10:00', '11:30', 'IT Lab, Bukit Timah CC');

-- Sign Up Events --
CREATE TABLE eventSignups (
    signupId INT IDENTITY(1,1) PRIMARY KEY,
    seniorId VARCHAR(10) NOT NULL,
    eventId INT NOT NULL,
    CONSTRAINT UQ_senior_event UNIQUE (seniorId, eventId),
    CONSTRAINT FK_eventSignups_Events FOREIGN KEY (eventId) REFERENCES Events(eventId) ON DELETE CASCADE,
    CONSTRAINT FK_eventSignups_Seniors FOREIGN KEY (seniorId) REFERENCES Seniors(seniorId) ON DELETE CASCADE
);

-- sarrinah's tables 
CREATE TABLE Activities (
  id INT IDENTITY(1,1) PRIMARY KEY,
  userId INT NOT NULL,
  activityName VARCHAR(100) NOT NULL,
  duration INT NOT NULL,
  date DATE NOT NULL,
  notes TEXT NULL
);

INSERT INTO Activities (userId, activityName, duration, date, notes)
VALUES (1, 'Read a book', 30, '2025-07-15', 'I manage to read a few chapters of my favourite book.');
 


-- akshaya 
CREATE TABLE MedicineReminders (
  id INT PRIMARY KEY IDENTITY,
  userId INT,
  title NVARCHAR(100),
  notes NVARCHAR(MAX),
  reminderDate DATETIME
);
