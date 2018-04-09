var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  title:{type: String, required: true},
  body: String,
  author: String,
  posted: {type: Date, default: Date.now}
});


mongoose.model('Post', PostSchema);
