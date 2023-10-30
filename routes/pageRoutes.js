const { Router } = require('express')
const pageController = require('../controllers/pageController')
const authController = require('../controllers/authController')

const router = Router()

router.get('/', 
	authController.protect, 
	pageController.homePage
)

router.route('/register')
	.get(pageController.registerPage)
	.post(pageController.registerPageHandler)

router.route('/login')
	.get(pageController.loginPage)
	.post(pageController.loginPageHandler)

router.route('/logout')
	.get(pageController.logout)

router
	.get('/profile', authController.profilePage)
	.get('/profile/:id', authController.userProfilePage)
	.use(authController.protect)
	.get('/tweet/:id', authController.tweetDetailsPage)



module.exports = router