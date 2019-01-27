const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');

router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req,res)=>{

    Category.find({}).then((categories)=>{
        res.render('admin/categories/index', {categories: categories});
    })
})

router.post('/create', (req,res)=>{
    const newCategory = new Category({
        name: req.body.name
    })

    newCategory.save().then(savedCategory=>{
        req.flash('success_message', `Category ${savedCategory.name} was created successfully`);
        res.redirect('/admin/categories');
    }).catch(err=>{
        req.flash('error_message', `Category was not created successfully`);
        res.redirect('/admin/categories');
    })
})

router.get('/edit/:id', (req,res)=>{
    Category.findById(req.params.id).then(category=>{
        res.render('admin/categories/edit', {category: category});
    }).catch((err)=>{
        console.log(err);
    })    
})

router.put('/edit/:id', (req,res)=>{
    Category.findById(req.params.id).then(category=>{
        category.name = req.body.name;

        category.save()
            .then(updatedCategory=>{
                req.flash('success_message', `Category ${updatedCategory.name} was created successfully`);
                res.redirect('/admin/categories');
            })
            .catch(err=>{
                console.log(err);
            })
    }).catch((err)=>{
        console.log(err);
    })    
})

router.get('/delete/:id', (req, res)=>{
    Category.findByIdAndRemove(req.params.id)
            .then(categoryRemoved=>{
                req.flash('success_message', `Category ${categoryRemoved.name} was successfully removed`)
                res.redirect('/admin/categories');
            })
            .catch(err=>{
                console.log(err);
            })
})

module.exports = router;