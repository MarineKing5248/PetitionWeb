const bcrypt = require("bcryptjs");
const {promisify} = require("util");
const spicedpg = require("spiced-pg");
const db = spicedpg("postgres:postgres:postgres@localhost:5432/dssignature");
const genSalt = promisify(bcrypt.genSalt);
const hash = promisify(bcrypt.hash);
const compare = promisify(bcrypt.compare);

exports.registrate = function(first, last, email, hash) {
    const q = `INSERT INTO signatures (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`;
    return db.query(q, [
        first || null,
        last || null,
        email || null,
        hash || null
    ]);
};

// exports.hashPassword = function hashPassword(plainTextPassword) {
//     return new Promise(function(resolve, reject) {
//         bcrypt.genSalt(function(err, salt) {
//             if (err) {
//                 return reject(err);
//             }
//             bcrypt.hash(plainTextPassword, salt, function(err, hash) {
//                 if (err) {
//                     return reject(err);
//                 }
//                 resolve(hash);
//             });
//         });
//     });
// };
//
// exports.checkPassword = function checkPassword(textEnteredInLoginForm, hash) {
//     return new Promise(function(resolve, reject) {
//         bcrypt.compare(textEnteredInLoginForm, hash, function(err, doesMatch) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(doesMatch);
//             }
//         });
//     });
// };
//another way to do it
exports.hashPassword = pass => {
    return genSalt().then(salt => {
        return hash(pass, salt);
    });
};
// //
exports.checkPass = (pass, hash) => {
    return compare(pass, hash);
}; // return true or false
//sql part

// exports
//     .hashPass("monkey")
//     .then(hash => {
//         console.log(hash);
//         return exports.checkPass("monkey", hash);
//     })
//     .then(doesMatch => console.log(doesMatch));
