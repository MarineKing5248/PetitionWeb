DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL primary key,
    first VARCHAR(255) not null,
    last VARCHAR(255) not null,
    email VARCHAR(255) not null UNIQUE,
    password  VARCHAR(255) not NULL
);

CREATE TABLE user_profiles (
    id SERIAL primary key,
    age INTEGER,
    city VARCHAR(255),
    url VARCHAR(255),
    user_id INTEGER REFERENCES users(id)
);

CREATE TABLE signatures (
    id SERIAL primary key,
    sign TEXT not null,
    user_id INTEGER REFERENCES users(id)
);

--how to drop table with foreign key  u should drop the table using reference first, then drop the one being referenced
