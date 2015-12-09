var express = require('express');
var router  = express.Router();

var mongoose = require('mongoose');
var User     = mongoose.model('User');
var Project  = mongoose.model('Project');


var projectController = {
	create : function(req, res){

		console.log("Create Project Post Route")
		console.log(req.body)

		// New instance of Project 
		var newProject = new Project(req.body);
		
		console.log(newProject)

		// Find user
		User.findById('565cd2ab0cc237897da7b49a', function(err, user){
			// Grab user id, set it to project user
			newProject.user = user._id;
			
			newProject.save(function(err){
				
				// Save project on user and save user
				user.project = newProject._id;
				user.save(function(err){
					console.log(user)
					res.redirect('/create-project');
				})
			});
		
		});
	}
}

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}



module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('index', { message: req.flash('message') });
	});



	router.get('/project', function(req, res){
		res.render('project')
	});

	router.get('/create-project', function(req, res){
		res.render('create-project')
	});

	router.post('/create-project', projectController.create);



	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true  
	}));

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
		res.render('home', { user: req.user });
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;
}





