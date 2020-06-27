const passport = require('passport');
const keys = require('../config/keys');
const User = require('../models/user');
const facebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'name', 'photos', 'email'],
    proxy: true
  },
  (accessToken, refreshToken, profile, cb) => {
    //console.log(profile);
    User.findOne({
        google: profile.id
    }).then((user) => {
        if(user){
            done(null, user);
        }else{
            const newUser = {
                facebook: profile.id,
                fullname: profile.displayName,
                lastname: profile.name.familyName,
                fistname: profile.name.givenName,
                email: profile.emails[0].value,
                image: 'http://graph.facebook.com/${profile.id}/picture?type=large'
            }
            //save data to mongodb
            new User(newUser).save()
            .then((user) => {
                done(null, user);
            })
        }
    })t
  }
));