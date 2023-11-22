/* Global Variables 	: res.render('home', payload)
		. logedInUser

*/

const sendTweetForm = $('#send-tweet-form')
const sendTweetButton = $('#send-tweet-form button')
const textarea = $('#send-tweet-form textarea')
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





// Tweet Input handler
if(!textarea.value.trim()) sendTweetButton.disabled = true
textarea.addEventListener('input', (evt) => {
	if(!evt.target.value.trim()) sendTweetButton.disabled = true
	if(evt.target.value.trim()) sendTweetButton.disabled = false
})

// POST /api/tweets  			: { tweet: inputValue }
sendTweetButton.addEventListener('click', async(evt) => {
	const inputValue = encodeHTML(textarea.value.trim())

	const { data, error } = await axios({ 
		url: '/api/tweets', 
		method: 'POST',
		data: { tweet: inputValue }
	})
	if(error) return console.log(`add tweet failed: ${error.message}`)

	const tweet = data.data
	textarea.value = ''

	// /public/js/utils.js: const getTweetHTML = () => {...}
	tweetsContainer.insertAdjacentHTML('afterbegin', getTweetHTML(tweet))
})


// GET /api/tweets
const fetchTweets = async () => {
	const { data, error } = await axios({ url: `/api/tweets?_sort=-createdAt&_limit=100`, method: 'GET', })
	if(error) {
		if(error.message) notFound.textContent = error.message
		notFound.style.display = 'block'
		loadingIcon.style.display = 'none'
		return
	}

	const tweets = data.data
	loadingContainer.remove()
		
	tweets?.forEach((tweet) => {
		if(!!tweet.pinned) {
			pinnedTweetContainer.innerHTML = ''
			pinnedTweetContainer.insertAdjacentHTML('beforeend', getTweetHTML(tweet))
			return
		}  

		tweetsContainer.insertAdjacentHTML('beforeend', getTweetHTML(tweet))
		
		
	}) // End of getTweets loop
}
fetchTweets()

//-----[ Chat Handler ]-----
// GET /api/tweets/:id 		: Chat Icon Click handling
// POST /api/tweets 			: { tweet: modalInputValue, replyTo: logedInUser._id }
tweetsContainer.addEventListener('click', async (evt) => {
	const submitButton = dialogEl.querySelector('[name=dialog-submit-button]')
	const container = evt.target.closest('.tweet-container')
	const tweetId = container.id


	if( evt.target.id !== 'chat') return

	const { data, error } = await axios({ url: `/api/tweets/${tweetId}`, method: 'GET' })
	if(error) return console.log(error)

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
		if(error) return console.log(error)

		const updatedTweet = data.data
		tweetsContainer.insertAdjacentHTML('afterbegin', getTweetHTML(updatedTweet))
		closeModal()
		console.log(updatedTweet)

	}) // end submit button click
	
})


//-----[ Retweet Handler ]-----
// GET /api/tweets/:id/retweet 		: Retweet Icon Click handling
tweetsContainer.addEventListener('click', async (evt) => {
	const container = evt.target.closest('.tweet-container')
	const tweetId = container.id

	if( evt.target.id !== 'retweet') return

	const { data, error } = await axios({ 
		url: `/api/tweets/${tweetId}/retweet`, 
		method: 'GET',
	})
	if(error) return console.log(error)

	const updatedUser = data.updatedUser
	const { updatedTweet, retweet } = data.data

	const retweetButton = container.querySelector('[name=retweet-button]')
	const retweetEl = container.querySelector('[name=retweet-button] span')
	const color = updatedTweet?.retweetUsers.includes(updatedUser?._id) ? '#3b82f6' : 'gray' 

	retweetEl.textContent = updatedTweet?.retweetUsers.length || ''
	retweetButton.style.color = color

	tweetsContainer.insertAdjacentHTML('afterbegin', getTweetHTML(retweet))
})

//-----[ Heart Handler ]-----
// GET /api/tweets/:id/likes 		: Heart/Love Icon Click handling
tweetsContainer.addEventListener('click', async (evt) => {
	const container = evt.target.closest('.tweet-container')
	const tweetId = container.id

	if( evt.target.id !== 'heart') return

	const { data, error } = await axios({ 
		url: `/api/tweets/${tweetId}/like`, 
		method: 'GET',
	})
	if(error) return console.log(error)

	const tweet = data.data

	const heartButton = container.querySelector('[name=heart-button]')
	const heartSpan = container.querySelector('[name=heart-button] span')
	const color = tweet?.likes.includes(logedInUser._id) ? '#3b82f6' : 'gray' 

	heartSpan.textContent = tweet?.likes.length || ''
	heartButton.style.color = color
})


//-----[ Pin Handler ]-----
// PATCH /api/tweets/:id 					: Pin Icon Click handling
tweetsContainer.addEventListener('click', async (evt) => {
	const container = evt.target.closest('.tweet-container')
	const tweetId = container.id
	const pinButton = evt.target

	const pinned = pinButton.classList.contains('active')

	if( pinButton.id === 'pin-button' && pinned) {

		const { data, error } = await axios({ 
			url: `/api/tweets/${tweetId}`, 
			method: 'PATCH',
			data: { pinned: false }
		})
		if(error) return console.log(error)
		const tweet = data.data


		const pinnedTweetEl = pinnedTweetContainer.firstChild
		pinnedTweetEl.remove()

		// pinnedTweetContainer.insertAdjacentElement('afterend', pinnedTweetEl)
		const currentTweetEl = stringToElement( getTweetHTML(tweet) )
		pinnedTweetContainer.insertAdjacentElement('afterend', currentTweetEl)

		return
	}




	if( pinButton.id !== 'pin-button') return

	const { data, error } = await axios({ 
		url: `/api/tweets/${tweetId}`, 
		method: 'PATCH',
		data: { pinned: true }
	})
	if(error) return console.log(error)

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
	const tweetId = container.id
	const deleteButton = evt.target

	if( deleteButton.id !== 'delete-button') return

	// return

	const { data, error } = await axios({ 
		url: `/api/tweets/${tweetId}`, 
		method: 'DELETE',
	})
	if(error) return console.log(error)

	const tweet = data.data
	console.log(tweet)
	container.remove()

})






// ------ Problem-1: Page not updated ? 
// Adding Tweets immediately before existing tweets: Event Delegation: to handle chat retween and heart
const tweetsContainerHandler = async(evt) => {
	const container = evt.target.closest('.tweet-container')
	const tweetId = container.id
	if(!tweetId) return console.log('tweet._id is undefined')

	//- //- const chatEl = document.querySelector(':scope #chat')
	//- const chatEl = $(':scope #chat')
	//- console.log(evt.target)



	//- -----[ Handle retweet button click ]-----
	if( evt.target.id === 'retweet' ) {
		const tweetId = evt.target.closest('.tweet-container').id

		const { data, error } = await axios({
			url: `/api/tweets/${tweetId}/retweet`,
			method: 'post',
			data: { tweetId }
		})

		if(error) return console.log(error.message)

		const retweet = data?.data
		const isLogedInUserLiked = retweet?.likes.includes(logedInUser._id)

		if(isLogedInUserLiked) {
			toggleIcon(evt)
			$(`:scope button[name=retweet-button] > span`).textContent = retweet?.likes.length
		} else {
			toggleIcon(evt)
			$(`:scope button[name=retweet-button] > span`).textContent = retweet?.likes.length
		}

	} // End

	//- -----[ Handle heart button click ]-----

	if( evt.target.id === 'heart' ) {
		//- toggleIcon2(evt)
		//- console.log(evt.target)
		//- return 

		const { data, error } = await axios({
			url: `/api/tweets/${tweetId}/like`,
			method: 'PATCH',
			data: { tweetId: 1 }
		})

		// Show error in UI
		if(error) console.log('show error in dom instead of log')


		const tweet = data?.data
		const isLogedInUserLiked = tweet?.likes.includes(logedInUser._id)

		if( isLogedInUserLiked ) {
			toggleIcon(evt)
			$(`:scope button[name=heart-button] > span`).textContent = tweet.likes.length

		} else {
			toggleIcon(evt, { activeColor: 'gray' })
			$(`:scope button[name=heart-button] > span`).textContent = tweet.likes.length
		}

	} // End

	//- // Its not removing side effects
	evt.target.removeEventListener('click', tweetsContainerHandler)
} 	
// $('#tweets-container').addEventListener('click', tweetsContainerHandler)


//- -------------------[ Start of Reply-Dialog ]-------------------------







// dialogSubmitButton.addEventListener('click', async (evt) => {

// 	const value = dialogTweetInput.value
// 	if( !value.trim() ) dialogCancelButton.disabled = true

// 	const tweetId =	dialogEl.dataset.tweetId 

// 	const { data, error } = await axios({
// 		url: `/api/tweets`,
// 		method: 'POST',
// 		data: { 
// 			tweet: value,  					// message
// 			replyTo: tweetId  			// tweet id
// 		} 			
// 	})

// 	if(error) return console.log(error)
// 	//- console.log(data.data)

// 		const tweet = data.data
// 	$('#tweets-container').insertAdjacentHTML('afterbegin', getTweetHTML(tweet))

// 	// clear value after form submition successfull
// 	closeModal()
// 	dialogTweetInput.value = '' 	// empty value
// })



// // Redirect to tweetDetails Page by clicking on tweet
// // Delete Tweet by clicking close button
// // Pin Tweet by clicking pin button
// $('#tweets-container').addEventListener('click', async (evt) => {
// 	const tweetContainer = evt.target.closest('.tweet-container')
// 	const tweetId = tweetContainer.id


// 	//- // -----[ Redirect to Tweet details page ]-----
// 	//- if(evt.target.classList.contains('profile')) {
// 	//- 	redirectTo(`/profile/${logedInUser.username}`)
// 	//- }


// 	// -----[ Redirect to Tweet details page ]-----
// 	if( evt.target.classList.contains('redirect') ) {
// 		redirectTo(`/tweet/${tweetId}`)
// 	}

// 	// -----[ handle deleting Tweet ]-----
// 	if(evt.target.name === 'delete-button') {
// 		const { error } = await axios({
// 			url: `/api/tweets/${tweetId}`,
// 			method: 'DELETE',
// 		})

// 		if(error) return console.log('show error in UI, instead of log')

// 		// remove current tweet immediately too from UI
// 		tweetContainer.remove()
// 	}

// 	// -----[ handle pin Tweet ]-----
// 	if(evt.target.name === 'pin-button') {


// 		// Step-1: Update in backend
// 		evt.target.disabled = true

// 		const { error, data } = await axios({
// 		 	url: `/api/tweets/${tweetId}`,
// 		 	method: 'PATCH',
// 		 	data: { pinned: true }
// 		 })

// 		 if(error) return console.log(`Show pin updated error in UI`)
// 		 evt.target.disabled = false
// 		//  location.reload() 	// Reload to take the updated style applied on


// 		// Step-2: Show effect on frontend
// 		const pinnedTweetContainer = $('#pinned-tweets-container')
// 		const tweetsContainer = $('#tweets-container')

// 		const pinnedTweetContainers = document.querySelectorAll('#pinned-tweets-container .tweet-container')
// 		const tweetContainers = document.querySelectorAll('#tweets-container .tweet-container')


// 		// 2.1: Empty pinnedContainer
// 		pinnedTweetContainers.forEach(tweet => {
// 			tweet.remove()

// 			tweetsContainer.insertAdjacentElement('afterbegin', tweet)
// 		})

// 		// 2.2: Remove clicked tweet from tweetsContainer
// 		const targetTweet = Array.from(tweetContainers).find(tweet => tweet.id === tweetId)
// 		targetTweet.remove()

// 		// 2.3: Add clicked tweet to pinnedContainer 
// 		const pinLabel = $(`:scope ${targetTweet.tagName} [name=pin-label]`)
// 		pinLabel.remove()

// 		const pinButton = $(`:scope ${targetTweet.tagName} [name=pin-button]`)
// 		pinButton.style.color = 'transparent'
// 		pinButton.style.stroke = '#64748b'
// 		pinnedTweetContainer.insertAdjacentElement('beforeend', targetTweet)


// 		// 2.4: Add color to pined tweet icon
// 		tweetContainers.forEach(tweet => {
// 			const pinButton = $(`:scope ${tweet.tagName} [name=pin-button]`)
// 			pinButton.style.color = '#64748b'
// 			pinButton.style.stroke = 'none'
// 		})


// 		// 2.5: Move pin-label from .tweet-container
// 		const pinnedTweet = pinnedTweetContainer.children[1]
// 		const pinLabelContainer = $(`:scope ${pinnedTweet.tagName} [name=pin-label-container]`)
// 		pinLabelContainer.insertAdjacentElement('afterbegin', pinLabel)


// 	} //- End of handle pin tweet

// }) //- End of redirect handler



