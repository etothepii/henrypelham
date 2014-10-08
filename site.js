var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
  , path = require('path')
  , socketio = require('socket.io')
  , db = require('./lib/frederickNorthDB');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

exports.listen = function(server) {
  var io = socketio.listen(server);
  io.set('log level', 1);
  io.sockets.on('connection', function(socket) {
    socket.on('watching', function(agent) {
      socket.emit('watching', watching(agent));
    });
  });
}

function watching(agent) {
  return {
    agent: agent,
    watching: []
  }
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://' + process.env.REALM + '/auth/google/return'
  },
  function(accessToken, refereshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

var app = express();

app.configure(function() {
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'nothing to see hear' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/index', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/watching', ensureAuthenticated, function(req, res) {
  db.getLeaflets(req.user.id, function(err, leaflets) {
    if (err) {
      res.render('error', {
        err: err
      });
    }
    else {
      res.render('leafletSelector', {
        user: req.user,
        leaflets: leaflets
      });
    }
  });
});

app.get('/watching/:leafletId', ensureAuthenticated, function(req, res) {
  var leafletId = req.params.leafletId;
  console.log("Requested watching list :%s for leaflet: %s", req.user.id, leafletId);
  db.getWatching(req.user.id, function(err, rootAreas, leafletId) {
    if (err) {
      res.render('error', {
       err: err
      }); 
    }
    else {
      res.render('watching', { 
        user: req.user,
        rootAreas: rootAreas
      });
    }
  });
});

app.get('/leaflet', function(req, res){
  res.render('leaflet', { user: req.user });
});

app.get('/election', function(req, res){
  res.render('election', { user: req.user });
});

app.get('/purchase', function(req, res){
  res.render('purchase', { user: req.user });
});

app.get('/auth/google',
  passport.authenticate('google', {scope: 'profile'}));

app.get('/auth/google/return',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

db.connect(function() {
  console.log("Launching site on port: " + process.env.SITE_PORT);
  app.listen(process.env.SITE_PORT);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/google')
}
