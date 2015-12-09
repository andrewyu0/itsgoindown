var mongoose = require('mongoose');
var Schema = mongoose.Schema;


module.exports = mongoose.model('User',{
	id        : String,
	username  : String,
	password  : String,
	email     : String,
	firstName : String,
	lastName  : String,
  project : { type: Schema.ObjectId, ref: 'Project'}
});