const { Router } = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const { profilePicture } = require('../middlewares/images')

const router = Router()

// router.post('/login', authController.login)

router
	.use(authController.protect)
	.get('/', userController.getAllUsers)
	.post('/avatar', profilePicture.single('avatar'), userController.userAvatarUpload) 	// 'avatar' is name comes from frontend
	.post('/cover-photo', profilePicture.single('coverPhoto'), userController.userCoverPhotoUpload) 	// 'coverPhoto' is name comes from frontend
	.patch('/:id/following', userController.following)

// /api/users
module.exports = router