var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	name: String,
	mail: { type: String, index: true },
	created_at: Date,
	last_login: Date
});

userSchema.pre('save', function(next) {
	if (!this.created_at)
		this.created_at = new Date();

	next();
});

var User = mongoose.model('User', userSchema);
module.exports = User;
