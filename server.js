const {
    saveUserSigned,
    getUsersSigned,
    getNumUsers,
    getSignature,
    regUsers,
    checkEmail,
    userProfile,
    selectPetitioners,
    getUserDetails,
    updateUserTable,
    updateUserprofileTable,
    deleteSignature,
    getSignedUserId
} = require("./db");
let secret;
if (process.env.secret) {
    secret = process.env.secret;
} else {
    const secrets = require("./secrets.json");
    secret = secrets.secret;
}
// const ca = require("chalk-animation");
const { checkPass, hashPass } = require("./pwdEncryption");
const express = require("express");
const csurf = require("csurf");
const cookieSession = require("cookie-session");
const app = express();
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(require("cookie-parser")());
app.disable("x-powered-by");
app.use(
    require("body-parser").urlencoded({
        extended: false
    })
); // used in POST reqs
app.use(
    cookieSession({
        secret: secret,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);
app.use(csurf());
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.engine("handlebars", hb({ defaultLayout: "main" }));
/***********************************************************************/
app.use(express.static("public"));

app.get("/", function(req, res) {
    res.render("home", { header: true }); //this part is amazing!!!learn this from roshnin
});

/*Route for calling registration page*/
app.get("/register", function(req, res) {
    res.render("register", { header: true });
});
/*Route for calling profile*/
app.get("/profile", function(req, res) {
    res.render("profile", { header: false });
});

app.get("/login", function(req, res) {
    res.render("login", { header: true });
});

app.get("/logout", function(req, res) {
    req.session = null;
    res.redirect("/");
});

app.get("/petition", checkforSigned, checkforUserId, function(req, res) {
    res.render("petition");
});

app.get("/petition/signed", checkforSigid, checkforUserId, function(
    req,
    res,
    next
) {
    const signId = req.session.signId;
    Promise.all([getNumUsers(), getSignature(signId)])
        .then(function(results) {
            res.render("signed", {
                numSigners: results[0].rows[0].count,
                signature: results[1].rows[0].sign
            });
        })
        .catch(function(err) {
            console.log(
                "Error occured in db query to get users and signatures:",
                err
            );
            res.status(500);
        });
});

app.get("/profile/edit", function(req, res) {
    const userId = req.session.userId;
    console.log("signid", userId);
    getUserDetails(userId)
        .then(function(userdetails) {
            res.render("profileEdit", {
                userdetails: userdetails.rows[0]
            });
        })
        .catch(function(err) {
            console.log("Error occured in edit profile query:", err);
        });
});

app.get("/petition/signers", checkforSigid, checkforUserId, function(
    req,
    res,
    next
) {
    getUsersSigned()
        .then(function(petitioners) {
            res.render("signers", {
                petitioners: petitioners.rows,
                cityflag: false
            });
        })
        .catch(function(err) {
            console.log("Error occured in getting signed users:", err);
        });
});

app.get("/petition/signers/:city", checkforSigid, checkforUserId, function(
    req,
    res
) {
    let city = req.params.city;
    selectPetitioners(city)
        .then(function(petitioners) {
            res.render("signers", {
                petitioners: petitioners.rows,
                cityflag: true
            });
        })
        .catch(function(err) {
            console.log("Error occured in gettting signer based on city:", err);
        });
});

/**************************************************************************/
app.post("/register", (req, res) => {
    if (req.body.first && req.body.last && req.body.emailid && req.body.passwd) {
        hashPass(req.body.passwd)
            .then(function(hashedpwd) {
                return regUsers(
                    req.body.first,
                    req.body.last,
                    req.body.emailid,
                    hashedpwd
                );
            })
            .then(function(userid) {
                req.session.userId = userid.rows[0].id;
                res.redirect("/profile");
            })
            .catch(function(err) {
                console.log("Error occured in register:", err);
                res.status(500);
            });
    } else {
        res.render("register", { err: true });
    }
});
/******************************************************************************/
app.post("/login", (req, res) => {
    let idval;
    if (req.body.emailid && req.body.pswd) {
        checkEmail(req.body.emailid)
            .then(function(results) {
                if (results.rows.length > 0) {
                    idval = results.rows[0].id;
                    return checkPass(req.body.pswd, results.rows[0].password);
                } else {
                    throw new Error();
                }
            })
            .then(function(match) {
                if (match) {
                    req.session.userId = idval;
                    /*get id for the sign if already signed*/
                    getSignedUserId(idval)
                        .then(function(results) {
                            if (results.rows.length > 0) {
                                req.session.signId = results.rows[0].id;
                                res.redirect("/petition/signed");
                            } else {
                                res.redirect("/petition");
                            }
                        })
                        .catch(function(err) {
                            console.log("Error occured in login:", err);
                            res.render("login", { err: true });
                        });
                } else {
                    throw new Error();
                }
            })
            .catch(function(err) {
                console.log("Error occured in login:", err);
                res.render("login", { err: true });
            });
    } else {
        res.render("login", { err: true });
    }
});
/**********************************************************************/
app.post("/profile", (req, res) => {
    let url = req.body.homepage;
    if (!url.startsWith("https://")) {
        url = "https://" + url;
    }
    userProfile(req.body.age, req.body.city, url, req.session.userId)
        .then(function() {
            res.redirect("/petition");
        })
        .catch(function(err) {
            console.log("Error occured in insert profile:", err);
            res.render("profile", { err: true });
        });
});

/**********************************************************************/
app.post("/petition", (req, res) => {
    if (req.body.sign) {
        let userid = req.session.userId;
        saveUserSigned(req.body.sign, userid)
            .then(function(sign) {
                req.session.signId = sign.rows[0].id;
                res.redirect("/petition/signed");
            })
            .catch(function(err) {
                console.log("Error occured in the petition signed:", err);
                res.status(500);
            });
    } else {
        res.render("petition", { err: true });
    }
});
/***************************************************************************/
app.post("/profile/Edit", (req, res) => {
    const userId = req.session.userId;
    let { first, last, emailid, passwd, age, city, url } = req.body;
    if (!url.startsWith("https://")) {
        url = "https://" + url;
    }
    if (passwd) {
        hashPass(passwd)
            .then(function(hashedpwd) {
                /*call function to update with the new hash*/
                Promise.all([
                    updateUserTable(first, last, emailid, userId, hashedpwd),
                    updateUserprofileTable(age, city, url, userId)
                ])
                    .then(function() {
                        res.redirect("/petition/signed");
                    })
                    .catch(function(err) {
                        console.log("Error occured in db query:", err);
                    });
            })
            .catch(function(err) {
                console.log("Error occured in hashing password:", err);
            });
    } else {
    /*call function to update without pwd*/
        Promise.all([
            updateUserTable(first, last, emailid, userId),
            updateUserprofileTable(age, city, url, userId)
        ])
            .then(function() {
                res.redirect("/petition/signed");
            })
            .catch(function(err) {
                console.log("Error occured in db query:", err);
            });
    }
});
/***************************************************************************/
app.post("/delete", (req, res) => {
    const signId = req.session.signId;
    deleteSignature(signId)
        .then(function() {
            req.session.signId = null;
            res.redirect("/petition");
        })
        .catch(function(err) {
            console.log("Error occured on delete:", err);
        });
});

/**********************************middle wares*****************************/
function checkforSigid(req, res, next) {
    if (!req.session.signId) {
        res.redirect("/petition");
    } else {
        next();
    }
}

function checkforSigned(req, res, next) {
    if (req.session.signId) {
        res.redirect("/petition/signed");
    } else {
        next();
    }
}

function checkforUserId(req, res, next) {
    if (!req.session.userId) {
        res.redirect("/register");
    } else {
        next();
    }
}
/**********************************************************************/
app.listen(
    process.env.PORT || 8080
    // , () => ca.rainbow("I am listening,bro")
);
