const { Router } = require('express')
const pageController = require('../controllers/pageController')
const authController = require('../controllers/authController')

const router = Router()

//=> / 	(root route)

router.route('/register')
	.get(pageController.registerPage)
	.post(pageController.registerPageHandler)

router.route('/login')
	.get(pageController.loginPage)
	.post(pageController.loginPageHandler)

router.route('/logout')
	.get(pageController.logout)

router.get('/testing', authController.protect, pageController.testing)
router.get('/', authController.protect, pageController.homePage)

router
	.use(authController.protect)
	.get('/profile', pageController.profilePage)
	.get('/profile/:id', pageController.profilePage)
	.get('/profile/:id/following', pageController.followingAndFollwers)
	.get('/profile/:id/followers', pageController.followingAndFollwers)
	.get('/tweet/:id', pageController.tweetDetailsPage)
	.get('/search', pageController.searchPage) // /search#tab-1 /search#tab-2

	.get('/message', pageController.messageInboxPage) 
	.get('/message/new', pageController.newMessageInboxPage) 
	.get('/message/:id', pageController.chatMessagePage) 

	.get('/notification', pageController.notificationPage) 

module.exports = router