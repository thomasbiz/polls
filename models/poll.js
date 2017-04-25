var mongoose = require('mongoose');
var slug = require('slug');

var ObjectId = mongoose.Schema.ObjectId;

var pollSchema = new mongoose.Schema({
	creator: ObjectId,
	title: String,
	slug: String,
	options: [{ text: String, votes: Number, creator: ObjectId }],
	created_at: Date,
});

pollSchema.pre('save', function(next) {
	if (!this.created_at)
		this.created_at = new Date();

	this.slug = slug(this.title);

	next();
});

var Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;
