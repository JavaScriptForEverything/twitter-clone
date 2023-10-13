const bcrypt = require('bcryptjs')
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
		default: '/images/users/default.jpg'
	},
}, {
	timestamps: true
})


userSchema.pre('save', async function(next) {
	if( !this.isModified('password') ) return next()

	this.password = await bcrypt.hash(this.password, 10)
	this.confirmPassword = undefined
	
	next()
})

// methods. add with instance and statics. adds with Model
userSchema.methods.isPasswordValid = async (password, hashedPassword) => {
	return await bcrypt.compare(password, hashedPassword)
}

const User = models.User || model('User', userSchema)
module.exports = User