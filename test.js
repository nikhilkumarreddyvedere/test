var config = require('./config_saml.json')[process.env.NODE_ENV || 'dev'];
var SamlStrategy = require('passport-saml').Strategy;
var express = require('express');
var connect = require('connect');
var auth = require('./auth');
var app = express();
var path = require('path');
var samlStrategy = require('passport-saml').Strategy;
app.configure(function () {
    app.use(express.logger());
    app.use(connect.compress());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ secret: "roomapplication session" }));
    app.use(auth.initialize());
    app.use(auth.session());
});

//Get Methods
app.get('/', auth.protected, function (req, res) {
    res.sendfile('index.html');
});

app.get('/home', auth.protected, function (req, res) {
    res.sendfile('index.html');
});

//auth.authenticate check if you are logged in
app.get('/login', auth.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function (req, res) {
    res.redirect('/');
});

//POST Methods, redirect to home successful login
app.post('/loginSuccess', auth.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function (req, res) {
    res.redirect('/home');
});


var samlStrategy = new SamlStrategy({
    issuer: config.auth.issuer,
    entryPoint: config.auth.entryPoint,
    logoutUrl: config.auth.logoutUrl,
    logoutCallback: config.auth.logoutCallback,
},
    function (profile, done) {

        //Here save the nameId and nameIDFormat somewhere
        user.saml = {};
        user.saml.nameID = profile.nameID;
        user.saml.nameIDFormat = profile.nameIDFormat;
        console.log("profile object in samlstrategy for logout.... ", user)
        //Do save

    });

app.get('/logout', function (req, res) {

    console.log('In int----------------------------');
    //Here add the nameID and nameIDFormat to the user if you stored it someplace.
    if (req.user == null) {
        return res.redirect('/');
    }

    // req.user.saml = {};
    // req.user.saml.nameID = req.user.id;
    //req.user.saml.nameIDFormat = req.user.id;

    console.log("user object...... ", req.user.nameID);

    req.user.nameID = req.user.nameID;
    req.user.nameIDFormat = req.user.nameIDFormat;


    samlStrategy.logout(req, function (err, request) {                       
             req.logout();
             res.redirect(request);

        
    });
});

//code for importing static files
app.use(express.static(path.join(__dirname, 'public')));
var currentPort = app.listen(process.env.PORT || 8000);
console.log("Server started at PORT " + currentPort);
