const { Router } = require('express');
const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')

// /api/reviews
const router = Router()

// router
// 	.use(authController.protect)

router.route('/')
	.get(reviewController.getAllReviews)
	.post(reviewController.createReview)

router.route('/:id')
	.patch(reviewController.updateReviewById)
	.delete(reviewController.deleteReviewById)

module.exports = router