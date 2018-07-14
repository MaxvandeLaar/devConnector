const express = require('express');
const router = express.Router();
const path = require('path');
const User = require(path.resolve('routes/models/User'));
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const Logger = require('winston-preformatted-logger');
const log = new Logger({logFilename: 'devConnector'}).logger;

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

module.exports = router;
