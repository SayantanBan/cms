const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const {
    isEmpty,
    uploadDir
} = require('../../helpers/upload-helper');
const fs = require('fs');
const {
    userAuthenticated
} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res) => {
    const perPage = 10;
    const page = req.query.page || 1;

    Post.find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate('category')
        .then(posts => {
            Post.count().then(postCount => {
                res.render('admin/posts', {
                    posts: posts,
                    current: parseInt(page),
                    pages: Math.ceil(postCount / perPage)
                })
            });
        })
})

router.get('/my-posts', (req, res) => {
    Post.find({
            user: req.user.id
        })
        .populate('category')
        .then(posts => {
            res.render('admin/posts/my-posts', {
                posts: posts
            });
        })
})

router.get('/create', (req, res) => {
    Category.find({}).then(categories => {
        res.render('admin/posts/create', {
            categories: categories
        });
    })
})

router.post('/create', (req, res) => {
    console.log(req.files);

    let filename = '';

    if (!isEmpty(req.files)) {

        let file = req.files.file;
        filename = Date.now() + '_' + file.name;

        let dirUploads = './public/uploads/';

        file.mv(dirUploads + filename, (err) => {
            if (err) return err;
        });
    }

    let allowComments = true;

    if (req.body.allowComments) {
        allowComments = true;
    } else {
        allowComments = false;
    }

    const newPost = new Post({
        user: req.user.id,
        title: req.body.title,
        status: req.body.status,
        allowComments: allowComments,
        body: req.body.body,
        file: filename,
        category: req.body.category
    })

    newPost.save().then(savePost => {
        req.flash('success_message', `Post ${savePost.title} was created successfully`);
        res.redirect('/admin/posts');
    }).catch((error) => {

    })
})

router.get('/edit/:id', (req, res) => {

    Post.findById(req.params.id).then(post => {
        Category.find({}).then(categories => {
            res.render('admin/posts/edit', {
                post: post,
                categories: categories
            });
        })
    }).catch((err) => {
        console.log(err);
    })
})

router.put('/edit/:id', (req, res) => {


    let allowComments = true;

    if (req.body.allowComments) {
        allowComments = true;
    } else {
        allowComments = false;
    }


    Post.findOne({
        _id: req.params.id
    }).then(post => {
        post.user = req.user.id,
            post.title = req.body.title,
            post.status = req.body.status,
            post.allowComments = allowComments,
            post.body = req.body.body,
            post.category = req.body.category

        if (!isEmpty(req.files)) {

            fs.unlink(uploadDir + post.file, (err) => {
                if (err) return err;
            })

            let file = req.files.file;
            let filename = Date.now() + '_' + file.name;

            let dirUploads = './public/uploads/';

            file.mv(dirUploads + filename, (err) => {
                if (err) return err;
            });

            post.file = filename;
        }

        post.save().then(updatedPost => {
            req.flash('success_message', `Post ${updatedPost.title} was successfully updated`)
            res.redirect('/admin/posts/my-posts');
            // res.status(200).send(updatedPost);
        })
    }).catch(err => {
        console.log(err);
    })
});

router.get('/delete/:id', (req, res) => {
    Post.findByIdAndRemove(req.params.id)
        .populate('comments')
        .then(postRemoved => {
            fs.unlink(uploadDir + postRemoved.file, (err) => {
                if (err) return err;

                if (!postRemoved.comments.length < 1) {
                    postRemoved.comments.forEach(comment => {
                        comment.remove();
                    })
                }
                req.flash('success_message', `Post ${postRemoved.title} was successfully removed`)
                res.redirect('/admin/posts/my-posts');
            })
            // res.status(200).send(`Post ${postRemoved.id} removed`);
        })
});

module.exports = router;