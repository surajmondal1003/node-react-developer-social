const express = require('express');
const router = express.Router();
var { authenticate } = require('../../middleware/authenticate');
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');


const User = require('../../models/User');
const Profile = require('../../models/Profile');

router.get(
    '/',
    authenticate,
    (req, res) => {
        const errors = {};

        Profile.findOne({ user: req.user._id })
            .populate('user', ['name', 'avatar'])
            .then(profile => {
                if (!profile) {
                    errors.noprofile = 'There is no profile for this user';
                    return res.status(404).json(errors);
                }
                res.json(profile);
            })
            .catch(err => res.status(404).json(err));
    }
);


router.get(
    '/handle/:handle',
    (req, res) => {
        const errors = {};

        Profile.findOne({ handle: req.params.handle })
            .populate('user', ['name', 'avatar'])
            .then(profile => {
                if (!profile) {
                    errors.noprofile = 'There is no profile for this user';
                    return res.status(404).json(errors);
                }
                res.json(profile);
            })
            .catch(err => res.status(404).json(err));
    }
);

router.get(
    '/user/:user_id',
    (req, res) => {
        const errors = {};

        Profile.findOne({ user: req.params.user_id })
            .populate('user', ['name', 'avatar'])
            .then(profile => {
                if (!profile) {
                    errors.noprofile = 'There is no profile for this user';
                    return res.status(404).json(errors);
                }
                res.json(profile);
            })
            .catch(err => res.status(404).json({ profile: 'There are no profile for this user' }));
    }
);


router.get(
    '/all',
    (req, res) => {
        const errors = {};

        Profile.find()
            .populate('user', ['name', 'avatar'])
            .then(profiles => {
                if (!profiles) {
                    errors.noprofile = 'There is no profiles';
                    return res.status(404).json(errors);
                }
                res.json(profiles);
            })
            .catch(err => res.status(404).json({ profile: 'There are no profiles' }));
    }
);

router.post(
    '/',
    authenticate,
    (req, res) => {
        const { errors, isValid } = validateProfileInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }


        const profileFields = {};
        profileFields.user = req.user.id;
        if (req.body.handle) profileFields.handle = req.body.handle;
        if (req.body.company) profileFields.company = req.body.company;
        if (req.body.website) profileFields.website = req.body.website;
        if (req.body.location) profileFields.location = req.body.location;
        if (req.body.status) profileFields.status = req.body.status;
        if (req.body.bio) profileFields.bio = req.body.bio;
        if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;
        // Skills - Spilt into array
        if (typeof req.body.skills !== 'undefined') {
            profileFields.skills = req.body.skills.split(',');
        }

        profileFields.social = {};
        if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
        if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
        if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
        if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
        if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

        // Create or Edit current user profile with unique handle
        Profile
            .findOne({ user: req.user.id })
            .then(profile => {
                // If profile not exist, then create a new one, Otherwise just update 

                // Create new profile
                if (!profile) {
                    // Check if handle exists (handle should be unoque for all profile)
                    Profile
                        .findOne({ handle: profileFields.handle })
                        .then(profile => {
                            if (profile) {
                                errors.handle = 'handle already exists';
                                res.status(400).json(errors);
                            }
                        });
                    new Profile(profileFields).save().then(profile => res.json(profile));
                }
                // Update the profile
                else {
                    // Check if handle exists for other user
                    Profile
                        .findOne({ handle: profileFields.handle })
                        .then(p => {
                            if (profile.handle !== p.handle) {
                                errors.handle = 'handle already exists';
                                res.status(400).json(errors);
                            }
                        });
                    Profile
                        .findOneAndUpdate(
                            { user: req.user.id },
                            { $set: profileFields },
                            { new: true }
                        )
                        .then(profile => res.json(profile));
                }
            });
    }
);

router.post('/experience', authenticate, (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            profile.experience.unshift(newExp);

            profile.save().then(profile => res.json(profile));
        });
});


router.post(
    '/education',
    authenticate,
    (req, res) => {
        const { errors, isValid } = validateEducationInput(req.body);

        // Check Validation
        if (!isValid) {
            // Return any errors with 400 status
            return res.status(400).json(errors);
        }

        Profile.findOne({ user: req.user.id }).then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            };

            // Add to exp array
            profile.education.unshift(newEdu);

            profile.save().then(profile => res.json(profile));
        });
    }
);


router.delete(
    '/experience/:exp_id',
    authenticate,
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then(profile => {
                // Get remove index
                const removeIndex = profile.experience
                    .map(item => item.id)
                    .indexOf(req.params.exp_id);

                // Splice out of array
                profile.experience.splice(removeIndex, 1);

                // Save
                profile.save().then(profile => res.json(profile));
            })
            .catch(err => res.status(404).json(err));
    }
);

router.delete(
    '/education/:edu_id',
    authenticate,
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then(profile => {
                // Get remove index
                const removeIndex = profile.education
                    .map(item => item.id)
                    .indexOf(req.params.edu_id);

                // Splice out of array
                profile.education.splice(removeIndex, 1);

                // Save
                profile.save().then(profile => res.json(profile));
            })
            .catch(err => res.status(404).json(err));
    }
);


router.delete(
    '/',
    authenticate,
    (req, res) => {
        Profile.findOneAndRemove({ user: req.user.id }).then(() => {
            User.findOneAndRemove({ _id: req.user.id }).then(() =>
                res.json({ success: true })
            );
        });
    }
);
module.exports = router;