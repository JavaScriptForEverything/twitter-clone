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
	.use(authController.protect)
	.get('/profile', authController.profilePage)
	.get('/profile/:id', authController.userProfilePage)
	.get('/profile/:id/following', authController.followingAndFollwers)
	.get('/profile/:id/followers', authController.followingAndFollwers)
	.get('/tweet/:id', authController.tweetDetailsPage)

	.get('/search', authController.searchPage) // /search#tab-1 /search#tab-2



module.exports = router