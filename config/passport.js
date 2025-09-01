const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const userDb = require("../db/user.js");

passport.use(new LocalStrategy(async(username, password, done) => {
    try {
        const user = await userDb.getUserByUsername(username);
        if(!user) return done(null, false, { message: "Incorrect username or password "});
        const match = await userDb.validatePassword(user, password);
        if(!match) return done(null, false, { message: "Incorrect username or password "});
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    return done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userDb.getUserById(id);
        return done(null, user);
    } catch (error) {
        return done(error);
    }
});

module.exports = passport;