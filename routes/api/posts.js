const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const Post = require(path.resolve('routes/models/Post'));
const Profile = require(path.resolve('routes/models/Profile'));
const validatePostInput = require(path.resolve('validation/post'));

/**
 * @route GET api/posts/test
 * @desc Test posts route
 * @access Public
 */
router.get('/test', (req, res, next) => {
    res.json({message: 'posts works'});
});

/**
 * @route POST api/posts
 * @desc Create a post
 * @access Private
 */
router.post('/', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const {errors, isValid} = validatePostInput(req.body);
    if (!isValid){
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save()
        .then(post => {
            res.json(post);
        });
});

/**
 * @route GET api/posts
 * @desc Get all posts
 * @access Public
 */
router.get('/', (req, res, next) => {
    Post.find()
        .sort({date: -1})
        .then(posts => {
            res.json(posts);
        })
        .catch(err => {
            res.status(500).json(err);
        });
});

/**
 * @route GET api/posts/:id
 * @desc Get post by id
 * @access Public
 */
router.get('/:id', (req, res, next) => {
    const errors = {};
    Post.findById(req.params.id)
        .then(post => {
            if (!post){
                errors.noPost = "No post found for this id";
                return res.status(400).json(errors);
            }
            res.json(post);
        })
        .catch(err => {
            res.status(500).json(err);
        });
});

/**
 * @route DELETE api/posts/:id
 * @desc Get post by id
 * @access Private
 */
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const errors = {};
    Profile.findOne({user: req.user.id})
        .then(profile => {
            if (!profile){
                errors.noProfile = "No profile exists"
                return res.status(404).json(errors);
            }
            Post.findById(req.params.id)
                .then(post => {

                    if (!post){
                        errors.noPost = "No post exists with this id";
                        return res.status(404).json(errors);
                    }

                    if (post.user.toString() !== req.user.id){
                        errors.unauthorized = "Not authorized";
                        return res.status(401).json(errors);
                    }

                    post.remove()
                        .then(() => {
                            res.json({success: true});
                        });
                })
                .catch(err => {
                    res.status(500).json(err);
                });
        });

});

module.exports = router;
