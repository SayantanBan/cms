const express = require('express');
const router = express.Router();
const Post = require('../../models/Post')
const Category = require('../../models/Category')
const Comment = require('../../models/Comment')
const faker = require('faker');
const {userAuthenticated} = require('../../helpers/authentication')

router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{

    const promises = [
        Post.count().exec(),
        Category.count().exec(),
        Comment.count().exec()
    ]

    Promise.all(promises).then(([postCount, categoryCount, commentCount])=>{
        res.render('admin/index', {postCount: postCount, categoryCount: categoryCount, commentCount: commentCount});
    })

    // Post.count().then(postCount=>{
    //     Category.count().then(categoryCount=>{
    //         Comment.count().then(commentCount=>{
    //             res.render('admin/index', {postCount: postCount, categoryCount: categoryCount, commentCount: commentCount});
    //         })
    //     })
    // })
});

router.get('/dashboard', (req, res)=>{
    res.render('admin/dashboard');
});

router.post('/generate-fake-posts', (req, res)=>{
    for(let i=0; i<req.body.amount; i++){
        let post = new Post({
            title: faker.name.title(),
            status: 'public',
            body: faker.lorem.sentence(),
            slug: faker.name.title(),
            allowComments: faker.random.boolean()
        });

        post.save()
            .then(savedPost=>{console.log(savedPost)})
            .catch((error)=>console.log(error));
    }
    res.redirect('/admin/posts')
})

module.exports = router;