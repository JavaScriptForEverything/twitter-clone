
exports.register = (req, res, next) => {
	
	const body = req.body

	res.status(200).json({
		status: 'success',
		data: body
	})
}

