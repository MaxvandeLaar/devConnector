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
const validateExperienceInput = require(path.resolve('validation/experience'));
const validateEducationInput = require(path.resolve('validation/education'));

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
 * @route GET api/profile/handle/:userId
 * @desc Get profile by handle
 * @access Public
 */
router.get('/user/:userId', (req, res, next) => {
    const errors = {};

    Profile.findOne({user: req.params.userId})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile){
                errors.noProfile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => {
            res.status(500).json(err);
        });
});

/**
 * @route GET api/profile/all
 * @desc Get all profiles
 * @access Public
 */
router.get('/all', (req, res, next) => {
    const errors = {};

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles){
                errors.noProfiles = 'There are no profiles';
                return res.status(404).json(errors);
            }

            res.json(profiles);
        })
        .catch(err => {
            res.status(500).json(err);
        })
});

/**
 * @route GET api/profile/handle/:handle
 * @desc Get profile by handle
 * @access Public
 */
router.get('/handle/:handle', (req, res, next) => {
    const errors = {};

    Profile.findOne({handle: req.params.handle})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile){
                errors.noProfile = 'There is no profile for this user';
                res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => {
            res.status(500).json(err);
        });
});

/**
 * @route POST api/profile/experience
 * @desc Add experience to a profile
 * @access Private
 */
router.post('/experience', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const {errors, isValid} = validateExperienceInput(req.body);

    if (!isValid){
        return res.status(400).json(errors);
    }

    Profile.findOne({user: req.user.id})
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            };

            if (!profile){
                errors.noProfile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }

            profile.experience.unshift(newExp);
            profile.save()
                .then(profile => {
                    res.json(profile);
                })

        })
});

/**
 * @route POST api/profile/education
 * @desc Add education to a profile
 * @access Private
 */
router.post('/education', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const {errors, isValid} = validateEducationInput(req.body);

    if (!isValid){
        return res.status(400).json(errors);
    }

    Profile.findOne({user: req.user.id})
        .then(profile => {
            const newEducation = {
                school: req.body.school,
                degree: req.body.degree,
                field: req.body.field,
                description: req.body.description,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current
            };

            if (!profile){
                errors.noProfile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }

            profile.education.unshift(newEducation);
            profile.save()
                .then(profile => {
                    res.json(profile);
                })

        })
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
