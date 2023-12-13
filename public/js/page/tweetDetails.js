import { Snackbar, getTweetHTML } from '/js/module/components/index.js'
import { $, axios, encodeHTML, stringToElement, updateNotificationBadge  } from '/js/module/utils.js'

/* Global Variables
		. logedInUser 	// comes from backend
		. tweetId  			// comes from backend 	: aslo checked is valid tweetId or not
*/



const sendTweetForm = $('#send-tweet-form')
const sendTweetButton = $('#send-tweet-form button')
const tweetsContainer = $('#tweets-container')
const pinnedTweetContainer = $('#pinned-tweet-container')

const loadingContainer = $('[name=loading-container]')
const notFound = $('[name=loading-container] [name=not-found]')
const loadingIcon = $('[name=loading-container] [name=loading-icon]')

const dialogEl = $('[name=reply-dialog]')
const tweetContainer = $('[name=reply-dialog] [name=tweet-container]')
const dialogCloseButton = $('[name=dialog-close-button]')
const dialogTweetInput = $('[name=dialog-tweet-input]')
const dialogCancelButton = $('[name=dialog-cancel-button]')
const dialogSubmitButton = $('[name=dialog-submit-button]')


// disabled submit button at first time
if( !dialogTweetInput.value.trim() ) dialogSubmitButton.disabled = true

const closeModal = () => {
	dialogEl.close()

	/* When we open modal data fetch from server, which may take some time to get
			in the min-time if any one open another modal he will see the old data, so
			reset the rold data when modal closes */ 
	tweetContainer.innerHTML = '' 	
	dialogTweetInput.value = '' 			
	dialogSubmitButton.disabled = true
}
dialogCloseButton.addEventListener('click', closeModal)
dialogCancelButton.addEventListener('click', closeModal)

// toggle submit on input change
dialogTweetInput.addEventListener('input', (evt) => dialogSubmitButton.disabled = !evt.target.value.trim() )

// -----[ End of reusable Functions ]-----



// GET /api/tweets/:id
const fetchTweetById = async () => {
	const { data, error } = await axios({ url: `/api/tweets/${tweetId}`})
	if(error) {
		notFound.textContent = error.message
		notFound.style.display = 'block'
		loadingIcon.style.display = 'none'

		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'cannot fetch all tweets',
			action: true,
		})

		return console.log(`cannot fetch all tweets: ${error.message}`)
	}

	const tweet = data.data
	loadingContainer.remove()
		
	if(!!tweet.pinned) {
		pinnedTweetContainer.insertAdjacentHTML('beforeend', getTweetHTML(tweet, logedInUser))
	}  

	if(tweet.replyTo) 
		tweetsContainer.insertAdjacentHTML('beforeend', getTweetHTML(tweet.replyTo, logedInUser))

	tweet.user.retweets.forEach( retweet => {
		if(retweet)
			tweetsContainer.insertAdjacentHTML('beforeend', getTweetHTML(retweet, logedInUser))
	})
}
fetchTweetById()

//-----[ Chat Handler ]-----
// GET /api/tweets/:id 		: Chat Icon Click handling
// POST /api/tweets 			: { tweet: modalInputValue, replyTo: logedInUser._id }
tweetsContainer.addEventListener('click', async (evt) => {
	const submitButton = dialogEl.querySelector('[name=dialog-submit-button]')
	const container = evt.target.closest('.tweet-container')
	if(!container) return console.log('container is null')

	const tweetId = container.id


	if( evt.target.id !== 'chat') return

	const { data, error } = await axios({ url: `/api/tweets/${tweetId}`})
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'getTweetById failed',
			action: true,
		})

		return console.log(`getTweetById failed: ${error.message}`)
	}

	const tweet = data.data
	dialogEl.showModal()
	dialogEl.dataset.tweetId = tweetId

	const htmlString = getTweetHTML(tweet, { isModal: true }) 	// public/js/utils.js
	tweetContainer.insertAdjacentHTML('beforeend', htmlString )

	submitButton.addEventListener('click', async (evt) => {
		const value = encodeHTML( dialogTweetInput.value.trim() )

		const { data, error } = await axios({ 
			url: `/api/tweets`, 
			method: 'POST',
			data: { tweet: value, replyTo: tweetId }
		})
		if(error) {
			Snackbar({
				severity: 'error',
				variant: 'filled',
				message: error.message || 'replyTo tweet failed',
				action: true,
			})

			return console.log(`replyTo tweet failed: ${error.message}`)
		}

		const updatedTweet = data.data
		// tweetsContainer.insertAdjacentHTML('afterbegin', getTweetHTML(updatedTweet))
		pinnedTweetContainer.insertAdjacentHTML('afterend', getTweetHTML(updatedTweet))
		closeModal()

	}) // end submit button click
	
})


//-----[ Retweet Handler ]-----
// GET /api/tweets/:id/retweet 		: Retweet Icon Click handling
tweetsContainer.addEventListener('click', async (evt) => {
	const container = evt.target.closest('.tweet-container')
	if(!container) return console.log('container is null')

	const tweetId = container.id

	if( evt.target.id !== 'retweet') return

	const { data, error } = await axios({ url: `/api/tweets/${tweetId}/retweet` })
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'retweet failed',
			action: true,
		})

		return console.log(`retweet failed: ${error.message}`)
	}

	const updatedUser = data.updatedUser
	const { updatedTweet, retweet } = data.data

	const retweetButton = container.querySelector('[name=retweet-button]')
	const retweetEl = container.querySelector('[name=retweet-button] span')
	const color = updatedTweet?.retweetUsers.includes(updatedUser?._id) ? '#3b82f6' : 'gray' 

	retweetEl.textContent = updatedTweet?.retweetUsers.length || ''
	retweetButton.style.color = color

	tweetsContainer.insertAdjacentHTML('afterbegin', getTweetHTML(retweet))

	updateNotificationBadge()
})

//-----[ Heart Handler ]-----
// GET /api/tweets/:id/likes 		: Heart/Love Icon Click handling
tweetsContainer.addEventListener('click', async (evt) => {
	const container = evt.target.closest('.tweet-container')
	if(!container) return console.log('container is null')

	const tweetId = container.id

	if( evt.target.id !== 'heart') return

	const { data, error } = await axios({ url: `/api/tweets/${tweetId}/like` })
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'toggle like tweet failed',
			action: true,
		})

		return console.log(`toggle like tweet failed: ${error.message}`)
	}

	const tweet = data.data

	const heartButton = container.querySelector('[name=heart-button]')
	const heartSpan = container.querySelector('[name=heart-button] span')
	const color = tweet?.likes.includes(logedInUser._id) ? '#3b82f6' : 'gray' 

	heartSpan.textContent = tweet?.likes.length || ''
	heartButton.style.color = color

	updateNotificationBadge()
})


//-----[ Pin Handler ]-----
// PATCH /api/tweets/:id 					: Pin Icon Click handling
tweetsContainer.addEventListener('click', async (evt) => {
	const container = evt.target.closest('.tweet-container')
	if(!container) return console.log('container is null')

	const tweetId = container.id
	const pinButton = evt.target

	const pinned = pinButton.classList.contains('active')

	// Step-1: unpin if already pined
	if( pinButton.id === 'pin-button' && pinned) {

		const { data, error } = await axios({ 
			url: `/api/tweets/${tweetId}`, 
			method: 'PATCH',
			data: { pinned: false }
		})
		if(error) {
			Snackbar({
				severity: 'error',
				variant: 'filled',
				message: error.message || 'unpin tweet failed',
				action: true,
			})

			return console.log(`unpin tweet failed: ${error.message}`)
		}

		const tweet = data.data


		const pinnedTweetEl = pinnedTweetContainer.firstChild
		pinnedTweetEl.remove()

		// pinnedTweetContainer.insertAdjacentElement('afterend', pinnedTweetEl)
		const currentTweetEl = stringToElement( getTweetHTML(tweet) )
		pinnedTweetContainer.insertAdjacentElement('afterend', currentTweetEl)

		return
	}




	// Step-2: pin and swap pinned and unpined elements possition
	if( pinButton.id !== 'pin-button') return

	const { data, error } = await axios({ 
		url: `/api/tweets/${tweetId}`, 
		method: 'PATCH',
		data: { pinned: true }
	})
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'pin tweet failed',
			action: true,
		})

		return console.log(`pin tweet failed: ${error.message}`)
	}

	const tweet = data.data

	const pinnedTweetEl = pinnedTweetContainer.firstChild
	pinnedTweetEl?.remove()
	container.remove()

	const currentTweetEl = stringToElement( getTweetHTML(tweet) )
	pinnedTweetContainer.insertAdjacentElement('afterbegin', currentTweetEl)
	if(pinnedTweetEl) pinnedTweetContainer.insertAdjacentElement('afterend', pinnedTweetEl)

	if(tweet.pinned) {
		pinButton.classList.remove('text-slate-50', 'stroke-slate-600')
		pinButton.classList.add('text-slate-500')
	} else {
		pinButton.classList.add('text-slate-50', 'stroke-slate-600')
		pinButton.classList.remove('text-slate-500')
	}

})

//-----[ Delete Handler ]-----
// DELETE /api/tweets/:id 					: Cross Icon Click handling
tweetsContainer.addEventListener('click', async (evt) => {
	const container = evt.target.closest('.tweet-container')
	if(!container) return console.log('container is null')

	const tweetId = container.id
	const deleteButton = evt.target

	if( deleteButton.id !== 'delete-button') return

	const { data, error } = await axios({ url: `/api/tweets/${tweetId}`, method: 'DELETE' })
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'delete tweet failed',
			action: true,
		})

		return console.log(`delete tweet failed: ${error.message}`)
	}

	const tweet = data.data
	console.log(tweet)
	container.remove()

	updateNotificationBadge()
})


