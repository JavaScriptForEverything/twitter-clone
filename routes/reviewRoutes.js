const { Router } = require('express');
const reviewController = require('../controllers/reviewController')

const router = Router()

router.route('/')
	.get(reviewController.getAllReviews)
	.post(reviewController.createReview)

module.exports = router