const { catchAsync, appError } = require('./errorController')
const Review = require('../models/reviewModel')
const { filterObjectByArray, apiFeatures, encodeHTML } = require('../utils')


// GET /api/reviews
exports.getAllReviews = catchAsync( async (req, res, next) => {

	const data = { 
		params: req.params,
		query: req.query
	}


	// const reviews = await apiFeatures(Review, req.query)

	res.status(200).json({
		status: 'success',
		// count: reviews.length,
		// data: reviews
		data
	})
})


// POST /api/reviews
exports.createReview = catchAsync( async (req, res, next) => {
	const review = req.body
	// const allowedFields = ['review', 'user', 'tweet']
	// const filteredBody = filterObjectByArray(req.body, allowedFields)
	// filteredBody.review = encodeHTML( filteredBody.review )

	// const review = await Review.create( filteredBody )
	// if( !review ) return next(appError('review create failed'))

	res.status(201).json({
		status: 'success',
		data: review
	})
})


// PATCH /api/reviews/:id
exports.updateReviewById = catchAsync( async (req, res, next) => {
	const review = { method: 'update', ...req.body, ...req.params }

	res.status(201).json({
		status: 'success',
		data: review
	})
})

// DELETE /api/reviews/:id
exports.deleteReviewById = catchAsync( async (req, res, next) => {
	const review = { method: 'delete', ...req.body, ...req.params }

	res.status(201).json({
		status: 'success',
		data: review
	})
})