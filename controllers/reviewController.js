const { catchAsync, appError } = require('./errorController')
const Review = require('../models/reviewModel')
const { filterObjectByArray, apiFeatures } = require('../utils')


// GET /api/reviews
exports.getAllReviews = catchAsync( async (req, res, next) => {
	const reviews = await apiFeatures(Review, req.query)

	res.status(200).json({
		status: 'success',
		count: reviews.length,
		data: reviews
	})
})


// POST /api/reviews
exports.createReview = catchAsync( async (req, res, next) => {
	const allowedFields = ['review', 'user', 'tweet']

	const filteredBody = filterObjectByArray(req.body, allowedFields)
	const review = await Review.create( filteredBody )
	if( !review ) return next(appError('review create failed'))

	res.status(201).json({
		status: 'success',
		data: review
	})
})