var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Project',{
  name           : String,
  created        : {type: Date, default: Date.now},
  // Reference to User
  user           : {type: Schema.ObjectId, ref: 'User'},
  uploadFileName : String,
  analysisLog    : [{type: Schema.ObjectId, ref: 'Analysis'}]
});