DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    first VARCHAR(200) NOT NULL, --NOT NULL isa constrain, if it will be empty
    last VARCHAR(200) NOT NULL,
    signature TEXT NOT NULL,
    user_id INTEGER REFERENCES user(id) NOT NULL   --foreign key
)

--INSERT INTO signatures (first, last, signat)
--VALUES ('', '', '');

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(200) NOT NULL,
    last VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL
);

--log in ,add a session, put ur userId



--early stage cant do it because it prevent sql to drop the users table
--when u log in u should return the user_id to let the user log in, if he already registered
--get get post post
