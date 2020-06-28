//load modules
const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');

const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('passport-google-oauth20');
require('passport-facebook');
require('passport-instagram');


const{
  ensureAuthentication,
  ensureGuest
} = require('./helpers/auth');

//server port number
const port = 3000;

//the mongoUrl exported from external file 
const keys = require('./config/keys');
const User = require('./models/user');
const user = require('./models/user');

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
app.get('/', ensureGuest, (req,res) =>{
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
      passport.authenticate('facebook', {scope: 'email'
      }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

  //instagram auth route
  app.get('/auth/instagram',
  passport.authenticate('instagram'));

app.get('/auth/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

  //add email route
  app.post('/addEmail', (req, res) => {
    const email = req.body.email;
    User.findById({_id: req.user._id})
    .then((user) => {
      user.email = email;
      user.save()
      .then(() => {
        res.redirect('/profile');
      });
    });
  });

  //add phone
  app.post('/addPhone', (req, res) => {
    const phone = req.body.phone;
    User.findById({_id: req.user._id})
    .then((user) => {
      user.phone = phone;
      user.save()
      .then(() => {
        res.redirect('/profile');
      });
    });
  });

  //add location
  app.post('/addLocation', (req, res) => {
    const location = req.body.location;
    User.findById({_id: req.user._id})
    .then((user) => {
      user.location = location;
      user.save()
      .then(() => {
        res.redirect('/profile');
      });
    });
  })

//connect to remote database, { useUnifiedTopology: true, useNewUrlParser: true } solve the depretion error
mongoose.Promise = global.Promise;
mongoose.connect(keys.MongoURI, { useUnifiedTopology: true, useNewUrlParser: true })
.then(() => {
    console.log('Connected to remote database successflly...');
}).catch((err) => {
    console.log(err);
});
// server listen request
app.listen(port, () =>{
    console.log('Server is now running on port ${port}');
});