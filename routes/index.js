var express = require('express');
var router  = express.Router();

var mongoose = require('mongoose');
var User     = mongoose.model('User');
var Project  = mongoose.model('Project');
var Analysis = mongoose.model('Analysis');

var fs = require('fs-extra');       //File System - for file manipulation
var path = require("path");



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

	// Upload file to the project

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


	// Create Analysis record
	router.post('/:projectId/create-analysis', function(req, res){
		console.log('---------- create analysis!')
		// Find project 
		var projectId = req.params.projectId;
		var newAnalysisData = {};
		Project.findById(projectId, function(err, project){
			
			newAnalysisData.name = project.uploadFileName;
			newAnalysisData.project = projectId;

			console.log("------------ create analysis record")

			// Create the new analysis record, with content file upload content
			var newAnalysis = new Analysis(newAnalysisData);
			console.log("---------- Save analysis record")
			newAnalysis.save(function(err){
				// Push the latest analysis to the project analysisLog array
				console.log("---------- push record into project analysis log array")
				project.analysisLog.push(newAnalysis);
				console.log("---------- pushed to the project")
				// Save the project
				project.save(function(err){
					res.redirect('/' + projectId + '/project');

					// res.redirect('/:projectId/project', {
					// 	user: req.user,
					// 	project: project
					// });
					// res.render('project', {
					// 	user: req.user,
					// 	project: project
					// });
				});
			});
		});
	});

	// Upload file route 

  router.post('/:projectId/upload', function (req, res, next) {

  		var projectId = req.params.projectId;
      var fstream;
      req.pipe(req.busboy);

      req.busboy.on('file', function (fieldname, file, filename) {
          
          console.log("Uploading: " + filename);

          //Path where image will be uploaded
          // fstream = fs.createWriteStream(__dirname + '/uploads/' + filename);
          // console.log(__dirname)
          
          // console.log(". = %s", path.resolve("."));
					// console.log("__dirname = %s", path.resolve(__dirname));

          fstream = fs.createWriteStream('./public/uploads/' + filename);
          file.pipe(fstream);
          fstream.on('close', function () {    
              console.log("Upload Finished of " + filename);              
              Project.findById(projectId, function(err, project){
								// Save filename to project
								project.uploadFileName = filename;
								project.save(function(err){
									res.render('project-file-uploaded', {
										user: req.user,
										project:project
									});
								});
              });
          });          
      });
  });



	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('index', { message: req.flash('message') });
	});


	router.get('/:projectId/project', function(req, res){
		
		console.log("--------- project GET route hit ")
		var projectId = req.params.projectId;
		// Project.findById(projectId, function(err, currentProject){
		// 	res.render('project', {
		// 		user: req.user,
		// 		project: currentProject
		// 	})
		// });
		Project.findById(projectId)
		.populate('analysisLog')
		// .populate('analysisLog', 'name')
		// .populate('analysisLog', 'created')
		.exec(function(err, currentProject){

			console.log("---------------------------")
			console.log(currentProject.analysisLog[0].name)
			console.log(currentProject)


			res.render('project', {
				user: req.user,
				project: currentProject
			});
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
	// router.post('/signup', passport.authenticate('signup', {
	// 	successRedirect: '/home',
	// 	failureRedirect: '/signup',
	// 	failureFlash : true  
	// }));

	router.post('/signup', function(req, res, next){
		passport.authenticate('signup', function(err, account){

			if(err){
				res.redirect('/signup')
			}
			console.log("-------------------")
			console.log(account)
			req.logIn(account, function(err){
				if(err){return next(err);}
				return res.redirect( '/' + account._id + '/home')
			})

		})(req, res, next)
	});

	
	/* GET Home Page */
	router.get('/:id/home', isAuthenticated, function(req, res){
		console.log("GET Home ")
		// Get project info here
		// @TODO: When does req.user get set? 
		var currentUser = req.user;

		Project.findById(req.user.project, function(err, userProject){
			
			// First time user with no project
			//@TODO: Ideally I'd like to hide the project cards. jQuery, Angular (not necessary)
			if(userProject == null){
				res.render('home-noproject', { 
					user: currentUser
				});				
			}
			else {
				res.render('home', { 
					user: currentUser,
					project: userProject
				});
			}

		});
	});


	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;
}





