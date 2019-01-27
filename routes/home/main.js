const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;


router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res) => {
    // req.session.user = 'Sayantan Banerjee'

    // if(req.session.user){
    //     console.log(`We found ${req.session.user}`);
    // }

    const perPage = 10;
    const page = req.query.page || 1;

    Post.find({
            status: 'public'
        })
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .then(posts => {
            Post.count().then(postCount => {
                Category.find({}).then(categories => {
                    res.render('home/index', {
                        posts: posts,
                        categories: categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount/perPage)
                    });
                })
            })
        })
})

router.get('/about', (req, res) => {
    res.render('home/about');
})

//APP LOGIN

router.get('/login', (req, res) => {
    res.render('home/login');
})

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    User.findOne({
        email: email
    }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {
                message: 'Incorrect username.'
            });
        }

        bcrypt.compare(password, user.password, (err, matched) => {
            if (err) return err

            if (matched) {
                return done(null, user);
            } else {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
        });
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })
);

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

//REGISTER

router.get('/register', (req, res) => {
    res.render('home/register');
})

router.post('/register', (req, res) => {

    let errors = [];

    if (!req.body.firstName) {
        errors.push({
            message: "please enter your first name"
        })
    }

    if (!req.body.lastName) {
        errors.push({
            message: "please enter your last name"
        })
    }

    if (!req.body.email) {
        errors.push({
            message: "please add a email"
        })
    }

    if (!req.body.password) {
        errors.push({
            message: "please enter a password"
        })
    }

    if (!req.body.confirmPassword) {
        errors.push({
            message: "This fiel cannot be blank"
        })
    }

    if (req.body.password !== req.body.confirmPassword) {
        errors.push({
            message: "Password fields don't match"
        })
    }


    if (errors.length > 0) {
        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
        })
    } else {

        User.findOne({
            email: req.body.email
        }).then(user => {
            if (user) {
                req.flash('error_message', 'That email exists, please login');
                res.redirect('/login');
            } else {
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(req.body.password, salt, function (err, hash) {
                        // Store hash in your password DB.
                        let newUSer = new User({
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email,
                            password: hash
                        })

                        newUSer.save()
                            .then(savedUser => {
                                console.log(savedUser);
                                req.flash('success_message', 'You are now registered, please login');
                                res.redirect('/login');
                            })
                            .catch(err => {
                                console.log(err);
                            })

                    });
                });
            }
        })
    }

})

router.get('/posts/:slug', (req, res) => {

    Post.findOne({
            slug: req.params.slug
        })
        .populate({
            path: 'comments',
            match: {
                approveComment: true
            },
            populate: {
                path: 'user',
                model: 'users'
            }
        })
        .populate('user')
        .then(post => {
            Category.find({}).then(categories => {
                console.log(post);
                res.render('home/post', {
                    post: post,
                    categories: categories
                });
            });
        }).catch((err) => {
            console.log(err);
        })
})

module.exports = router;