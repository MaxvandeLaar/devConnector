const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const path = require('path');
const keys = require(path.resolve('configs/keys'));
const Logger = require('winston-preformatted-logger');
const log = new Logger({logFilename: 'devConnector'}).logger;
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys.secret
};

module.exports = passport => {
    passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
        log.info("TOKEN", {meta: jwtPayload});
        User.findById(jwtPayload.id)
            .then(user => {
                if (user){
                    return done(null, user);
                }
                return done(null, false);
            })
            .catch(err => {
                log.stack(err);
            });
    }));
};