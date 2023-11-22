/* Global Variables 	: res.render('home', payload)
		. logedInUser

	/public/js/utils.js:
		. getTweetHTML( tweetDoc )
		. stringToElement( htmlString )
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

	// tweetsContainer.insertAdjacentHTML('afterbegin', getTweetHTML(tweet))
	pinnedTweetContainer.insertAdjacentHTML('afterend', getTweetHTML(tweet))
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
		// tweetsContainer.insertAdjacentHTML('afterbegin', getTweetHTML(updatedTweet))
		pinnedTweetContainer.insertAdjacentHTML('afterend', getTweetHTML(updatedTweet))
		closeModal()

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

	// Step-1: unpin if already pined
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




	// Step-2: pin and swap pinned and unpined elements possition
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



// -----[ Redirect to Tweet details page ]-----
tweetsContainer.addEventListener('click', async (evt) => {
	const container = evt.target.closest('.tweet-container')
	const tweetId = container.id

	if( !evt.target.classList.contains('redirect') ) return

	redirectTo(`/tweet/${tweetId}`)
})
