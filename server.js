const ca = require("chalk-animation");
const db = require("./db");
const express = require("express");
const app = express();
app.use(require("cookie-parser")());
app.use(
    require("body-parser").urlencoded({
        extended: false
    })
); // used in POST requests
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
const csurf = require("csurf");
const cookieSession = require("cookie-session");

const bc = require("./bcrypt");
/***********************************************************************/
//2 ways to write middleware , one is app.use(function(req, res, next){})
//the other one is to make a function

//PURPOSE: to check if user signed petitioners
//if they have, proceed with whatever they were doing
//if not redirect them elsewhere

app.use(
    cookieSession({
        secret: `Try harder`,
        maxAge: 1000 * 60 * 60 * 24 * 365 //365 days
    })
);
app.use(csurf());

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use(express.static("public"));
////////////Registrate Part//////////////
app.get("/registration", (req, res) => {
    res.render("registration", {
        layout: "main"
    });
});

app.post("/registration", (req, res) => {
    if (req.body.first && req.body.last && req.body.email) {
        let hash = bc.hashPassword(req.body.password);
        hash.then(function() {
            bc.registrate(req.body.first, req.body.last, req.body.email, hash)
                // .then(results => {
                //     req.session = {
                //         logID: results.rows[0].id
                //     };
                //     req.session.logID;
                //     res.redirect("/");
                // })
                .catch(err => {
                    console.log(err);
                    res.render("registration", {
                        layout: "main",
                        error: true
                    });
                });
        });
    } else {
        res.render("userexist", {layout: "main", err: true});
    }
    // res.render("registration", {
    //     layout: "main"
    // });
});

/////////////Log in Part/////////////////
app.get("/", (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

app.post("/", (req, res) => {
    let check = bc.checkPass(req.body.password);
    if (check === true) {
        res.render("sign", {
            layout: "main"
        });
    } else {
        res.redirect("/Error");
    }
});

app.get("/Error", (req, res) => {
    res.render("error", {
        layout: "main"
    });
});

app.post("error", (req, res) => {
    if (bc.hashPass === true) {
        res.render("sign", {
            layout: "main"
        });
    } else {
        res.redirect("/Error");
    }
});

///////Sign Up Part////////////////////////////////
app.get("/petition", (req, res) => {
    res.render("sign", {
        layout: "main"
    });
});

function checkForSign(req, res, next) {
    if (!req.session.signID) {
        res.redirect("/petition");
    } else {
        next();
    }
}
// if the checkForSig goes to next() part, then we go to res,render() here
app.get("/thanks", checkForSign, (req, res) => {
    const signID = req.session.signID;
    Promise.all([db.getNum(), db.getSignatureById(signID)]).then(results => {
        res.render("thanks", {
            layout: "main",
            signature: results[1].rows[0].signature,
            count: results[0].rows[0].count
        });
    });
});

app.get("/signers", (req, res) => {
    db.queryDb().then(names => {
        res.render("signers", {
            layout: "main",
            signers: names.rows,
            count: names.rowCount
        });
    });
});

app.post("/petition", (req, res) => {
    console.log(req.body);
    if (req.body.first && req.body.last && req.body.sign) {
        db.inputSigner(req.body.first, req.body.last, req.body.sign)
            .then(results => {
                req.session = {
                    signID: results.rows[0].id
                };
                req.session.signID;
                console.log("session: ", req.session);
                res.redirect("/thanks");
            })
            .catch(err => {
                console.log(err);
                res.render("sign", {
                    layout: "main",
                    error: true
                });
            });
    } else {
        res.render("sign", {layout: "main", err: true});
    }
});
app.listen(8080, () => ca.rainbow("I am listening"));
