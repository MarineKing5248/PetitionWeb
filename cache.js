var redis = require("redis");
var client = redis.createClient({
    host: "localhost",
    port: 6379
});

client.on("error", function(err) {
    console.log(err);
});

//GET info from redis

module.exports.get = key => {
    return new Promise((resolve, reject) => {
        client.get(key, (err, data) => {
            if (err) {
                reject("error in redis GET: ", err);
            } else {
                resolve(data);
            }
        });
    });
};

// SETEX in redis
module.exports.setex = (key, expiry, val) => {
    //the order of key, expiry, val has to be like this, cant be changed
    //expiry is time to leave
    return new Promise((reject, resolve) => {
        client.setex(key, expiry, val, (err, data) => {
            if (err) {
                reject("err in SETEX: ", err);
            } else {
                resolve(data);
            }
        });
    });
};

//DEL from redis
module.exports.del = key => {
    client.del(key);
};
