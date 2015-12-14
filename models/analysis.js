var mongoose = require("mongoose");
var Schema = mongoose.Schema;


module.exports = mongoose.model('Analysis', {
  name    : String,
  project : {type: Schema.ObjectId, ref: 'Project'},
  created : {type: Date, default: Date.now}
});