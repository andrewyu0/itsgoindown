var express = require('express');
var router  = express.Router();

var mongoose = require('mongoose');
var User     = mongoose.model('User');
var Project  = mongoose.model('Project');


var projectController = {
	create : function(req, res){

		console.log("Create Project Post Route")

		// New instance of Project 
		var newProject = new Project(req.body);
		var userId     = req.params.userId;

		// Find user
		User.findById(userId, function(err, user){
			// Grab user id, set it to project user
			newProject.user = user._id;
			
			newProject.save(function(err){
				
				// Save project on user and save user
				user.project = newProject._id;
				user.save(function(err){
					console.log(user)
					res.redirect('/'+ userId + '/home');
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


	router.get('/:projectId/project', function(req, res){
		var projectId = req.params.projectId;
		Project.findById(projectId, function(err, currentProject){
			console.log(currentProject)
			res.render('project', {
				user: req.user,
				project: currentProject
			})
		});

	});

	router.get('/:userId/create-project', function(req, res){
		res.render('create-project', {user: req.user})
	});

	router.post('/:userId/create-project', projectController.create);

	/* Handle Login POST */
	// router.post('/login', passport.authenticate('login', {
	// 	successRedirect: '/home',
	// 	failureRedirect: '/',
	// 	failureFlash : true  
	// }));

	router.post('/login', function(req, res, next){
		console.log('log in invoked')

		passport.authenticate('login', function(err, account){
			if(err){
				// handle redirect
				res.redirect('/')
			}
			console.log(account)
			// res.redirect('http://google.com');
			req.logIn(account, function(err){
				if(err){return next(err);}
				return res.redirect( '/' + account._id + '/home')
			})
		})(req, res, next);
	});


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
	router.get('/:id/home', isAuthenticated, function(req, res){
		console.log("GET Home ")
		// Get project info here
		// @TODO: When does req.user get set? 

		console.log(req.user)
		var currentUser = req.user;

		Project.findById(req.user.project, function(err, userProject){
			console.log(userProject)
			res.render('home', { 
				user: currentUser,
				project: userProject
			});
		});

	});


	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;
}





