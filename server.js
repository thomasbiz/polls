var express = require('express');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

/* models */
var User = require('./models/user');
var Poll = require('./models/poll');

/* db */
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/polls')
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));

/* express setup */
var app = express();

app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded( { extended: true } ));
app.use(
	session({ 
		secret: 'butt munchers' ,
		resave: false,
		saveUninitialized: true
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'pug');

/* handlers */

app.get('/', function(req, res) {
	var polls = Poll.find(function(err, polls) {
		if (err) console.log(err);
		res.render('index', { title: 'Hey', message: 'Hello world!', user: req.user, polls: polls });
	});
});


app.get('/poll/new', function(req, res) {
	console.log(req.user);
	res.render('poll_create', { title: 'Create poll', user: req.user });
});

app.post('/poll/new', function(req, res) {
	var poll = new Poll({
		creator: req.user._id,
		title: req.body.title
	});
	poll.save(function(err) {
		if (err) console.log(err);
		res.redirect('/');
	});
});

app.get('/poll/:slug', function(req, res) {
	var poll = Poll.findOne({'slug': req.params.slug },
		function(err, poll) {
			if (err) console.log(err);
			if (poll)
				res.render('poll', { title: poll.title });
			else
				res.redirect('/');
		}
	);
});

/* google auth */
var GoogleStrategy = require('passport-google-oauth20').Strategy;

process.env.GOOGLE_CLIENT_ID = '247771429202-13ebtqsoev8sod2vs95s8lo8i2j2l86s.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET = '1BF3tUJEdERlnGFCy3trsdI0';

passport.use(
	new GoogleStrategy({
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: 'http://localhost:3000/auth/google/callback'
	},
	function(accessToken, refreshToken, profile, done) {
		var mail = profile.emails[0].value;
		User.findOne({ 'mail': mail }, 
			function(err, user) {
				if (err) return done(err);
				if (!user) {
					user = new User({
						name: profile.displayName,
						mail: mail
					});
					user.save(function(err) {
						if (err) console.log(err);
						return done(null, user);
					});
				} else {
					return done(null, user);
				}
			}
		);
	})
);

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
	function(req, res) {
		// successful auth
		res.redirect('/');
	}
);

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

var port = process.env.PORT || 3000;

app.listen(3000, function() {
    console.log('Running on port 3000');
});
