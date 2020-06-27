//load modules
const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');

const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('passport-google-oauth20');
require('passport-facebook');

//server port number
const port = 3000;

//the mongoUrl exported from external file 
const keys = require('./config/keys');
const User = require('./models/user');

//initial my application
const app = express();

//passport configue
app.use(cookieParser());
app.use(bodyParser());
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

//setup template engine
app.engine('handlebars', exphbs({
    layoutsDir: 'views/layouts',
    defaultLayout: 'main',
    extname: '.handlebars'
}));
app.set('view engine', 'handlebars');

//setup the static file to serve css, javascript and images
app.use(express.static('public'));


//handle routes
app.get('/', (req,res) =>{
    res.render('home', { title: 'Hey', message: 'Hello there!' })
    //res.render('home');
}); 

app.get('/about', (req,res) => {
    res.send('fsd');
});

// Google Auth Route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });

  app.get('/profile',(req, res) => {
    User.findById({_id: req.user._id})
    .then((user) => {
        res.render('profile', {
            user: user
        });
    })
  });

  app.use('/logout', (req, res) => {

  });

  //facebook auth route
  app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
  +
//connect to remote database, { useUnifiedTopology: true, useNewUrlParser: true } solve the depretion error
mongoose.Promise = global.Promise;
mongoose.connect(keys.MongoURI, { useUnifiedTopology: true, useNewUrlParser: true })
.then(() => {
    console.log('Connected to remote database successflly...');
}).catch((err) => {
    console.log(err);
});

app.listen(port, () =>{
    console.log('Server is now running on port ${port}');
});