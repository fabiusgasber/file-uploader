require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("./config/passport.js");
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const prisma = require("./prisma/client.js");
const path = require("path")
const app = express();
const PORT = process.env.PORT || 3000;
const indexRouter = require("./routers/indexRouter.js");
const userRouter = require("./routers/userRouter.js");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(session({
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000
    },
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
        prisma, 
        {
            checkPeriod: 2 * 60 * 1000,
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined
        }
    )
}));
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});
app.use((req, res, next) => {
    res.locals.loginError = req.session.messages;
    req.session.messages = [];
    next();
})
app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);
app.use("/user", userRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).send(err.message || "Internal server error");
});

app.listen(PORT, () => {
    console.log(`File uploader listening on port ${PORT}`);
});