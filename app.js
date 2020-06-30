//load modules
const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');

const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

require('passport-google-oauth20');
require('passport-facebook');
require('passport-instagram');

//link passport to server
require('./passport/google-passport');
require('./passport/facebook-passport');
require('./passport/instagram-passport');


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
const Post = require('./models/post');

//initial my application
const app = express();

//passport configue
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(session({
   secret: 'keyboard cat',
   resave: true,
   saveUninitialized: true
}));
app.use(methodOverride('_method'));
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

  //handle profile route
  app.get('/profile', ensureAuthentication, (req, res) => {
    Post.find({user: req.user._id})
    .populate('user')
    .then((posts) => {
        res.render('profile', {
            posts: posts
        });
    });
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

  // handle delete post route
  app.delete('/:id', (req, res) => {
    Post.remove({_id:req.params.id})
    .then(() => {
      res.redirect('/profile');
    });
  });

//hand get post route
app.get('/addPost', (req, res) => {
  res.render('addPost');
});
//add post route
app.post('/savePost', (req, res) => {
  const allowComments;
  if(req.body.allowComments){
      allowComments = true;
  }else{
    allowComments = false;
  }
  const newPost = {
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments: allowComments,
    user: req.user._id
  }
  new Post(newPost).save()
  .then(() => {
    res.redirect('/posts');
  });
});
//handle editPost route
app.get('/editPost/:id', (req, res) => {
    Post.findOne({_id:req.params.id})
    .then((post) => {
      res.render('editingPost', {
        post: post
      });
    });
});

//handle put editingPost route
app.put('/editingPost/:id', (req, res) => {
    Post.findOne({_id: req.params.id})
    .then((post) => {
      var allowComments;
      if(req.body.allowComments){
        allowComments = true;
      }else{
        allowComments = false;
      }
      post.title = req.body.title;
      post.body = req.body.body;
      post.status = req.body.status;
      post.allowComments = req.body.allowComments;
      post.save()
      .then(() => {
        res.redirect('/profile');
      });
    });
});

//handle posts route
app.get('/posts', ensureAuthentication, (req, res) => {
    Post.find({status: 'public'})
    .populate('user')
    .populate('comments.commentUser')
    .sort({date:'desc'})
    .then((posts) => {
        res.render('publicPosts', {
            posts: posts
        });
    });
});

//display one user 's posts
app.get(('/showposts/:id'), (req, res) => {
  Post.find()
});

  //add location
  app.post('/addLocation', (req, res) => {
    const location = req.body.location;
    User.findById({_id: req.user.id})
    .then((user) => {
      user.location = location;
      user.save()
      .then(() => {
        res.redirect('/profile');
      });
    });
  })

  //handle route for all users
  app.get('/users', ensureAuthentication, (req, res) => {
    User.find({}).then((users) => {
      res.render('users',{users:users});
    });
  });

  //
  app.get('/user/:id', (req, res) => {
      User.findById({_id: req.param.id})
      .then((user) => {
        res.render('user', {
          user: user
        });
      });
  });

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