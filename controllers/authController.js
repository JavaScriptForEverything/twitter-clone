

exports.protect = (req, res, next) => {
	// if(req.originalUrl.startsWith('/api')) return next()

	if(req.session?.user ) return next()
	res.redirect('/login')
}



// // POST 	/api/users/login
// exports.login = async (req, res, next) => {
// 	const allowedFields = ['email', 'password']
// 	const filteredBody = filterObjectByArray(req.body, allowedFields)

// 	const { email, password } = filteredBody
// 	if(!email || !password) throw new Error(`Requried email and password`)

// 	const user = await User.findOne({ email }).select('+password')
// 	if(!user) throw new Error(`you are not registerted user, please register first`)
	
// 	const isPasswordValid = await user.isPasswordValid(password, user.password)
// 	if(!isPasswordValid) throw new Error(`Your password is incorrect`)
// 	user.password = undefined 		// Don't send password to user

// 	// req.session.user = user
// 	req.user = user
// 	console.log('login: ', user._id, req.user._id)

// 	res.status(201).json({
// 		status: 'success',
// 		token: 'alsdjfasldjfalskdjfasldfj',
// 		// data: user
// 	})	
// }






