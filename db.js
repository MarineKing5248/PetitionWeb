const spicedpg = require("spiced-pg");

const db = spicedpg("postgres:postgres:postgres@localhost:5432/dssignature");

exports.inputSigner = function(first, last, signature) {
    const q = `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id`;
    return db.query(q, [first || null, last || null, signature || null]);
};

exports.getSignatureById = id => {
    const q = "SELECT signature FROM signatures WHERE id = ($1)";
    return db.query(q, [id]);
};

exports.queryDb = () => {
    return db.query("SELECT first,last FROM signatures");
};

exports.getNum = () => {
    return db.query("SELECT COUNT(*) FROM signatures");
};
