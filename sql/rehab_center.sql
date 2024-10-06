-- user table
CREATE TABLE user_account (
    id BIGSERIAL PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    username VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(60)
);

-- outlet location
CREATE TABLE outlet_location (
    id BIGSERIAL PRIMARY KEY,
    outlet_name VARCHAR(255) NOT NULL
);

CREATE TYPE address AS (
    street    VARCHAR(100),
    city      VARCHAR(20),
    state     VARCHAR(20),
    postcode  VARCHAR(10),
    country   VARCHAR(56)
);

CREATE TYPE enum_gender
AS 
ENUM('M','F');

-- patient table
CREATE TABLE customer (
    identification_number CHAR(12) PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender enum_gender NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    home_address address NOT NULL,
    email VARCHAR(255) NOT NULL,
    recover BOOLEAN NOT NULL DEFAULT FALSE
);
-- timeslot table
CREATE TABLE timeslot (
    id BIGSERIAL PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);
-- session table
CREATE TABLE treatment_session(
    id BIGSERIAL PRIMARY KEY,
    identification_number CHAR(12) NOT NULL,
    outlet_id BIGINT NOT NULL,
    timeslot_id BIGINT NOT NULL,
    treatment_date date NOT NULL,
    attendance BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (identification_number) REFERENCES customer(identification_number),
    FOREIGN KEY (outlet_id) REFERENCES outlet_location(id),
    FOREIGN KEY (timeslot_id) REFERENCES timeslot(id)
);

CREATE INDEX treatment_date_idx
ON treatment_session(treatment_date);
