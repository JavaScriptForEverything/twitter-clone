const { Schema, models, model } = require('mongoose');

// username
// email
// password
// confirmPassword
// avatar

const userSchema = new Schema({
	username: {
		type: String,
		requied: true,
		trim: true,
		minlength: 3,
		maxlength: 30
	},
	email: {
		type: String,
		unique: true,
		requied: true,
		trim: true,
		minlength: 3,
		maxlength: 30
	},
	password: {
		type: String,
		requied: true,
		minlength: 4,
		maxlength: 30
	},
	confirmPassword: {
		type: String,
		requied: true,
		validate: function(value) { return this.password === value }
	},
	avatar: {
		type: String,
	},
}, {
	timestamps: true
})




const User = models.User || model('User', userSchema)
module.exports = User