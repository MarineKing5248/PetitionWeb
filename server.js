const {
    saveUserSigned,
    getUsersSigned,
    getNumUsers,
    getSignature,
    regUsers,
    checkEmail,
    userProfile,
    selectPetitioners,
    getUserDetails
} = require("./db");
const ca = require("chalk-animation");
const { checkPass, hashPass } = require("./pwdEncryption");
const express = require("express");
const csurf = require("csurf");
const cookieSession = require("cookie-session");
const app = express();
const hb = require("express-handlebars");
app.engine(
    "handlebars",
    hb({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");
app.use(require("cookie-parser")());
app.disable("x-powered-by"); //non-standard response field that is used by web servers
app.use(
    require("body-parser").urlencoded({
        extended: false
    })
); // used in POST requests
app.use(
    cookieSession({
        secret: `Comon bro!`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);
app.use(csurf());
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});
/***********************************************************************/
app.use(express.static("public"));
//homepage
app.get("/homepage", function(req, res) {
    res.render("homepage");
});

/*Route for calling registration page*/
app.get("/register", function(req, res) {
    res.render("register");
});
/*Route for calling profile*/
app.get("/profile", function(req, res) {
    res.render("userProfile");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/petition", checkforSigned, checkforUserId, function(req, res) {
    res.render("sign");
});

app.get("/petition/signed", checkforSigid, checkforUserId, function(req, res) {
    const signId = req.session.signId;
    Promise.all([getNumUsers(), getSignature(signId)])
        .then(function(results) {
            res.render("Signed", {
                numSigners: results[0].rows[0].count,
                signature: results[1].rows[0].sign
            });
        })
        .catch(function(err) {
            console.log("Error occured:", err);
            res.status(500);
        });
});
app.get("/profile/edit", function(req, res) {
    const signId = req.session.signId;
    console.log("signid", signId);
    getUserDetails(signId)
        .then(function(userdetails) {
            console.log("det:", userdetails.rows);
            res.render("profileEdit", {
                userdetails: userdetails.rows[0]
            });
        })
        .catch(function(err) {
            console.log("Error occured:", err);
        });
});
app.post("/profile/Edit", (req, res) => {});

app.get("/petition/signers", checkforSigid, checkforUserId, function(req, res) {
    getUsersSigned()
        .then(function(petitioners) {
            res.render("signers", {
                petitioners: petitioners.rows,
                cityflag: false
            });
        })
        .catch(function(err) {
            console.log("Error occured:", err);
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
            console.log("Error occured:", err);
        });
});

/**************************************************************************/
app.post("/register", (req, res) => {
    if (
        req.body.first &&
    req.body.last &&
    req.body.emailid &&
    req.body.password
    ) {
        hashPass(req.body.password)
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
                console.log("Error occured:", err);
                res.status(500);
            });
    } else {
        res.render("register", { err: true });
    }
});

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
                    res.redirect("/petition");
                } else {
                    throw new Error();
                }
            })
            .catch(function(err) {
                console.log("Error occured:", err);
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
            console.log("Error occured:", err);
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
                console.log("Error occured:", err);
                res.status(500);
            });
    } else {
        res.render("sign", { err: true });
    }
});

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
app.listen(8080, () => ca.rainbow("I am listening,bro"));
