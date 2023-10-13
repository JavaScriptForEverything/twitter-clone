exports.pageNotFound = (req, res) => {
	const payload = { pageTitle: 'Not Found' }

	res.render('notFound', payload)
}


exports.errorHandler = (err, req, res, next) => {

	// res.status(400).json({
	// 	message: err.message,
	// 	stack: err.stack
	// })

	const payload = {
		pageTitle : 'Error',
		errorMessage: err.message,
		stack: err.stack
	}

	res.render('error', payload)
}