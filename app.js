const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const {mongoDbUrl} = require('./config/database')
const passport = require('passport');

mongoose.Promise = global.Promise;

mongoose.connect(mongoDbUrl).then(db => {
    console.log('MONGO connected');
}).catch(error=> console.log(error));

mongoose.connection
        .once('open', ()=> console.log('CONNECTED'))
        .on('error', (err)=>{
            console.log(`could not connect ${err}`);
        })



//Session

app.use(session({
    secret: 'cms',
    resave: true,
    saveUninitialized: true
}));

//Flash

app.use(flash());

//Using Static

app.use(express.static(path.join(__dirname,'public')))

//Passport
app.use(passport.initialize());
app.use(passport.session());

//Local Variables using Middleware

app.use((req, res, next)=>{
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});


//Upload Middleware

app.use(upload());

//Body Parser

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Method Override

app.use(methodOverride('_method'));

//Declare Routes

const main = require('./routes/home/main');
const admin = require('./routes/admin/admin');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');

//Load Routes

app.use('/', main);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);

//Set View Engine

const {select, GenerateTime, paginate} = require('./helpers/handlebars-helpers');

app.engine('handlebars', exphbs({defaultLayout: 'home', helpers: {select: select, generateTime: GenerateTime, paginate: paginate}}));
app.set('view engine', 'handlebars');

const port = process.env.port || 4500;

app.listen(port, (err)=>{
    if(err) return err;

    console.log('CONNECTED');
});