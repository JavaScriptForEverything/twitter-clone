exports.protect = (req, res, next) => {
	if(req.session.user ) return next()

	res.redirect('/login')
}



exports.userProfilePage = (req, res, next) => {

	// return next(new Error('my error'))

	const payload = {
		pageTitle: 'Profile'
	}

	res.render('user/profile', payload)
}

