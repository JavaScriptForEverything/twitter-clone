exports.catchAsync = (fn) => {
	return (req, res, next) => {
		return fn(req, res, next).catch(next)
	}
}

exports.appError = (message='', statusCode=400, status='error') => {
	const error = new Error(message) 	
	error.statusCode = statusCode
	error.status = status

	return error
}


exports.pageNotFound = (req, res) => {
	const payload = { pageTitle: 'Not Found' }

	res.render('notFound', payload)
}


exports.errorHandler = (err, req, res, next) => {

	res.status(err.statusCode || 404).json({
		message: err.message,
		status: err.status || 'failed',
		stack: err.stack
	})

	// const payload = {
	// 	pageTitle : 'Error',
	// 	errorMessage: err.message,
	// 	stack: err.stack
	// }

	// res.render('error', payload)
}