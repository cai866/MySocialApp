const { model } = require("../../models/user");

model.exports = {
    ensureAuthentication: (req, res, next) => {
        if(req.isAuthenticated()){
            next();
        }
        else{
            resizeBy.redirect('/');
        }
    },
    ensureGuest: (req, res, next) => {
        if(req.isAuthenticated()){
            res.redirect('/profile');
        }else{
            next();
        }
    }
}