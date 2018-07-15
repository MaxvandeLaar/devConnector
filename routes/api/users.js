const express = require('express');
const router = express.Router();
const path = require('path');
const User = require(path.resolve('routes/models/User'));
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const Logger = require('winston-preformatted-logger');
const log = new Logger({logFilename: 'devConnector'}).logger;
const jwt = require('jsonwebtoken');
const keys = require(path.resolve('configs/keys'));
const passport = require('passport');

/**
 * @route GET api/users/test
 * @desc Test users route
 * @access Public
 */
router.get('/test', (req, res, next) => {
    res.json({message: 'Users works'});
});

/**
 * @route POST api/users/register
 * @desc To register a user
 * @access Public
 */
router.post('/register', (req, res, next) => {
    User.findOne({email: req.body.email })
        .then(user => {
            if (user){
                return res.status(400).json({email: 'email already exists'});
            } else {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar: gravatar.url(req.body.email, {s: '200', r: 'pg', d:'mm'}),
                    password : req.body.password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (error, hash) => {
                        if (error) throw error;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                res.json(user);
                            }).catch(err => {
                                log.stack(err);
                        });
                    });
                });
            }
        });
});

/**
 * @route POST api/users/login
 * @desc Login User / return JWT
 * @access Public
 */
router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email})
        .then(user => {
            if (!user) {
                return res.status(404).json({email: 'User not found'});
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch){
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar
                        };

                        jwt.sign(payload, keys.secret, {expiresIn: 3600}, (err, token) => {
                            res.json({success: true, token: `Bearer ${token}`});
                        });

                    } else {
                        return res.status(400).json({password: 'Password incorrect'});
                    }
                })
        })
        .catch(error => {
            log.stack(error);
            return res.status(500).json({error: 'Something went wrong'});
        })
});

/**
 * @route POST api/users/current
 * @desc Return current user
 * @access Private
 */
router.get('/current', passport.authenticate('jwt', {session: false,}), (req, res, done) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

module.exports = router;
