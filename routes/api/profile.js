const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const Profile = require(path.resolve('routes/models/Profile'));
const User = require(path.resolve('routes/models/User'));
const Logger = require('winston-preformatted-logger');
const log = new Logger({logFilename: 'devConnector'}).logger;
const validateProfileInput = require(path.resolve('validation/profile'));

/**
 * @route GET api/profile/test
 * @desc Test profile route
 * @access Public
 */
router.get('/test', (req, res, next) => {
    res.json({message: 'Profiles works'});
});

/**
 * @route GET api/profile
 * @desc Return current user's profile
 * @access Private
 */
router.get('/', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const errors = {};

    Profile.findOne({user: req.user.id})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noProfile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => {
            log.stack(err);
            return res.status(500).json(err);
        });
});

/**
 * @route POST api/profile
 * @desc Create user profile
 * @access Private
 */
router.post('/', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const {errors, isValid} = validateProfileInput(req.body);

    if (!isValid){
        return res.status(400).json(errors);
    }

    const profileFields = {
        user: req.user.id,
        handle: req.body.handle || undefined,
        company: req.body.company || undefined,
        website: req.body.website || undefined,
        location: req.body.location || undefined,
        bio: req.body.bio || undefined,
        status: req.body.status || undefined,
        githubUsername: req.body.githubUsername || undefined,
        skills: req.body.skills ? req.body.skills.split(',') : undefined,
        social: {
            youtube: req.body.youtube || undefined,
            facebook: req.body.facebook || undefined,
            twitter: req.body.twitter || undefined,
            linkedIn: req.body.linkedIn || undefined,
            instagram: req.body.instagram || undefined
        }
    };

    Profile.findOne({user: req.user.id})
        .then(profile => {
            if (profile) {
                // Update
                Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {new: true})
                    .then(profile => {
                        res.json(profile);
                    });
            } else {
                // create

                Profile.findOne({handle: profileFields.handle})
                    .then(profile => {
                        if (profile){
                            errors.handle = 'That handle already exists';
                            res.status(400).json(errors);
                        }
                    });

                new Profile(profileFields).save()
                    .then(profile => {
                       res.json(profile);
                    });
            }
        });

});

module.exports = router;
