var spicedpg = require("spiced-pg");

var db = spicedpg("postgres:postgres:postgres@localhost:5432/dissignature");

module.exports.saveUserSigned = function(signature, userid) {
    var query = `INSERT INTO signatures(sign,user_id) VALUES($1,$2)
	RETURNING id`;

    return db.query(query, [signature || null, userid || null]);
};

module.exports.getUsersSigned = function() {
    var query = `
	SELECT users.first, users.last, user_profiles.age, user_profiles.city,
	user_profiles.url
	FROM user_profiles
	JOIN users
	ON users.id=user_profiles.user_id
    JOIN signatures
    ON users.id = signatures.user_id`;
    return db.query(query);
};

module.exports.getNumUsers = function() {
    var query = `SELECT COUNT(*) FROM signatures`;
    return db.query(query);
};

module.exports.getSignature = function(signId) {
    var query = `SELECT sign FROM signatures WHERE id=$1`;
    return db.query(query, [signId]);
};

module.exports.regUsers = function(first, last, email, password) {
    var query = `INSERT INTO users(first,last,email,password)
	VALUES($1,$2,$3,$4) RETURNING id`;

    return db.query(query, [
        first || null,
        last || null,
        email || null,
        password || null
    ]);
};

module.exports.checkEmail = function(emailid) {
    var query = `SELECT * FROM users WHERE email=$1`;
    return db.query(query, [emailid]);
};

module.exports.selectPetitioners = function(city) {
    var query = `SELECT users.first, users.last,
	user_profiles.age,user_profiles.url
	FROM users
	JOIN user_profiles
	ON users.id=user_profiles.user_id
	WHERE user_profiles.city=$1`;
    return db.query(query, [city]);
};

module.exports.getUserDetails = function(userid) {
    var query = `SELECT users.first, users.last,users.email,
	user_profiles.age,user_profiles.city,user_profiles.url
	FROM users
	JOIN user_profiles
	ON users.id=user_profiles.user_id
	WHERE users.id=$1`;
    return db.query(query, [userid]);
};

module.exports.userProfile = function(age, city, homepage, userid) {
    var query = `INSERT INTO user_profiles(age,city,url,user_id)
	VALUES($1,$2,$3,$4)`;
    return db.query(query, [age || null, city || null, homepage || null, userid]);
};