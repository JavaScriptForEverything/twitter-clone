// --- [ js Code ]---
const button = $('button')
const textarea = $('textarea')

if(!textarea.value.trim()) button.disabled = true
textarea.addEventListener('input', (evt) => {
	if(!textarea.value.trim()) button.disabled = true
	if(textarea.value.trim()) button.disabled = false
})

// Add Tweets by clicking Tweet button
button.addEventListener('click', async(evt) => {
	const res = await fetch('/api/tweets', {
		method: 'post',
		body: JSON.stringify({ tweet: textarea.value.trim() }),
		headers: {
			'content-type': 'application/json'
		}
	})

	const data = await res.json()
	const tweet = data.data
	textarea.value = ''
	//- console.log(data)

	// /public/js/utils.js: const getTweetHTML = () => {...}
	$('#tweets-container').insertAdjacentHTML('afterbegin', getTweetHTML(tweet))
})

// shows tweets by fetching from backend
const fetchTweets = async () => {
	try {
		const res = await fetch('/api/tweets', {
			method: 'get',
			headers: {
				'content-type': 'application/json'
			}
		})

		const data = await res.json()
		//- console.log(data.data[data.data.length - 1])

		data.data?.reverse().forEach((tweet, _, tweets) => {
			if(!!tweet.pinned) {
				$('#pinned-tweets-container').insertAdjacentHTML('beforeend', getTweetHTML(tweet))
			} else {
				// /public/js/utils.js: const getTweetHTML = () => {...}
				$('#tweets-container').insertAdjacentHTML('beforeend', getTweetHTML(tweet))
			}

		}) // End of getTweets loop


	} catch (err) {
		console.log(err.message)
	}
}
fetchTweets();




// ------ Problem-1: Page not updated ? 
// Adding Tweets immediately before existing tweets: Event Delegation: to handle chat retween and heart
const tweetsContainerHandler = async(evt) => {
	const container = evt.target.closest('.tweet-container')
	const tweetId = container.id
	if(!tweetId) return console.log('tweet._id is undefined')

	//- //- const chatEl = document.querySelector(':scope #chat')
	//- const chatEl = $(':scope #chat')
	//- console.log(evt.target)


	//- -----[ Handle chat button click ]-----
	if( evt.target.id === 'chat' ) {

		const { data, error } = await axios({
			url: `/api/tweets/${tweetId}`,
			method: 'get',
		})

		if(error) return console.log(error)

		dialogEl.showModal()
		dialogEl.dataset.tweetId = tweetId

		// /public/js/utils.js: const getTweetHTML = () => {...}
		tweetContainer.innerHTML = getTweetHTML(data.data, { isModal: true })


	} // End of Chat button


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
$('#tweets-container').addEventListener('click', tweetsContainerHandler)


//- -------------------[ Start of Reply-Dialog ]-------------------------


const dialogEl = $('[name=reply-dialog]')
const tweetContainer = $('[name=reply-dialog] [name=tweet-container]')

const dialogCloseButton = $('[name=dialog-close-button]')
const dialogCancelButton = $('[name=dialog-cancel-button]')
const dialogSubmitButton = $('[name=dialog-submit-button]')
const dialogTweetInput = $('[name=dialog-tweet-input]')




// disabled submit button at first time
if( !dialogTweetInput.value.trim() ) dialogSubmitButton.disabled = true

// toggle submit on input change
dialogTweetInput.addEventListener('input', (evt) => {
	dialogSubmitButton.disabled = !evt.target.value.trim() 
})

const closeModal = () => {
	dialogEl.close()

	/* When we open modal data fetch from server, which may take some time to get
			in the min-time if any one open another modal he will see the old data, so
			reset the rold data when modal closes */ 
	tweetContainer.innerHTML = '' 	
}


dialogCloseButton.addEventListener('click', (evt) => {
	closeModal()
})
dialogCancelButton.addEventListener('click', (evt) => {
	closeModal()
	dialogTweetInput.value = '' 	// empty value
})

dialogSubmitButton.addEventListener('click', async (evt) => {

	const value = dialogTweetInput.value
	if( !value.trim() ) dialogCancelButton.disabled = true

	const tweetId =	dialogEl.dataset.tweetId 

	const { data, error } = await axios({
		url: `/api/tweets`,
		method: 'POST',
		data: { 
			tweet: value,  					// message
			replyTo: tweetId  			// tweet id
		} 			
	})

	if(error) return console.log(error)
	//- console.log(data.data)

		const tweet = data.data
	$('#tweets-container').insertAdjacentHTML('afterbegin', getTweetHTML(tweet))

	// clear value after form submition successfull
	closeModal()
	dialogTweetInput.value = '' 	// empty value
})



// Redirect to tweetDetails Page by clicking on tweet
// Delete Tweet by clicking close button
// Pin Tweet by clicking pin button
$('#tweets-container').addEventListener('click', async (evt) => {
	const tweetContainer = evt.target.closest('.tweet-container')
	const tweetId = tweetContainer.id


	//- // -----[ Redirect to Tweet details page ]-----
	//- if(evt.target.classList.contains('profile')) {
	//- 	redirectTo(`/profile/${logedInUser.username}`)
	//- }


	// -----[ Redirect to Tweet details page ]-----
	if( evt.target.classList.contains('redirect') ) {
		redirectTo(`/tweet/${tweetId}`)
	}

	// -----[ handle deleting Tweet ]-----
	if(evt.target.name === 'delete-button') {
		const { error } = await axios({
			url: `/api/tweets/${tweetId}`,
			method: 'DELETE',
		})

		if(error) return console.log('show error in UI, instead of log')

		// remove current tweet immediately too from UI
		tweetContainer.remove()
	}

	// -----[ handle pin Tweet ]-----
	if(evt.target.name === 'pin-button') {


		// Step-1: Update in backend
		evt.target.disabled = true

		const { error, data } = await axios({
		 	url: `/api/tweets/${tweetId}`,
		 	method: 'PATCH',
		 	data: { pinned: true }
		 })

		 if(error) return console.log(`Show pin updated error in UI`)
		 evt.target.disabled = false
		//  location.reload() 	// Reload to take the updated style applied on


		// Step-2: Show effect on frontend
		const pinnedTweetContainer = $('#pinned-tweets-container')
		const tweetsContainer = $('#tweets-container')

		const pinnedTweetContainers = document.querySelectorAll('#pinned-tweets-container .tweet-container')
		const tweetContainers = document.querySelectorAll('#tweets-container .tweet-container')


		// 2.1: Empty pinnedContainer
		pinnedTweetContainers.forEach(tweet => {
			tweet.remove()

			tweetsContainer.insertAdjacentElement('afterbegin', tweet)
		})

		// 2.2: Remove clicked tweet from tweetsContainer
		const targetTweet = Array.from(tweetContainers).find(tweet => tweet.id === tweetId)
		targetTweet.remove()

		// 2.3: Add clicked tweet to pinnedContainer 
		const pinLabel = $(`:scope ${targetTweet.tagName} [name=pin-label]`)
		pinLabel.remove()

		const pinButton = $(`:scope ${targetTweet.tagName} [name=pin-button]`)
		pinButton.style.color = 'transparent'
		pinButton.style.stroke = '#64748b'
		pinnedTweetContainer.insertAdjacentElement('beforeend', targetTweet)


		// 2.4: Add color to pined tweet icon
		tweetContainers.forEach(tweet => {
			const pinButton = $(`:scope ${tweet.tagName} [name=pin-button]`)
			pinButton.style.color = '#64748b'
			pinButton.style.stroke = 'none'
		})


		// 2.5: Move pin-label from .tweet-container
		const pinnedTweet = pinnedTweetContainer.children[1]
		const pinLabelContainer = $(`:scope ${pinnedTweet.tagName} [name=pin-label-container]`)
		pinLabelContainer.insertAdjacentElement('afterbegin', pinLabel)


	} //- End of handle pin tweet

}) //- End of redirect handler



