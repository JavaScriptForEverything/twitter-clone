import { joinUserByChatId, sendTypingEvent, sendingNewMessageEvent } from '/js/socket.js'
import { Snackbar } from '/js/module/components/index.js'
import $, { axios, encodeHTML, decodeHTML, updateMessageBadge } from '/js/module/utils.js'


/* Global Variables
		. logedInUser
*/

// We can't get chatId from backend, because here we can have chatId == chatId || userId
const url = new URL(location.href)
const chatId = url.pathname.split('/').pop()

const dialog = $('[name=change-group-name]')
const dialogCloseButton = $('[name=dialog-close-button]')
const dialogCancelButton = $('[name=dialog-cancel-button]')
const dialogSubmitButton = $('[name=dialog-submit-button]')
const groupName = $('[name=dialog-tweet-input]')
const editChat = $('[name=edit-chat]')
const sendInput = $('#send-input')
const sendButton = $('#send-button')
const messageContainer = $('[name=message-container]')
const imageContainer = $('[name=chat-image-container]')
const sendMessageForm = $('#send-message-form')
const typingIndicator = $('[name=typing-indicator]')
const pageLoadingIndicator = $('[name=page-loading-indicator]')
const deleteChatButton = $('[name=delete-chat]')

let timer = undefined
sendInput.value=''




window.addEventListener('DOMContentLoaded', (evt) => {
	handleChatViewed(chatId)

	getAllMessagesOfSingleChat(chatId)
	getChatById( chatId )
})

// GET /api/messages/:id 	
const handleChatViewed = async (chatId) => {
	const { data, error } = await axios({ 
		url: `/api/chats/${chatId}`,
		method: 'PATCH',
		data: { isOpened: true } 	// 
	})
	if(error) return Snackbar({
		severity: 'error',
		variant: 'filled',
		message: error.message || 'fetch all messages failed',
		action: true,
	})

}



// GET /api/messages/:id 	
const getAllMessagesOfSingleChat = async (chatId) => {
	pageLoadingIndicator.classList.remove('hidden') 	// Show loading

	const { data, error } = await axios({ url: `/api/messages/${chatId}` })
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'fetch all messages failed',
			action: true,
		})

		return console.log(`fetch all messages  failed: ${error.message}`)
	}

	const messageDocs = data.data
	pageLoadingIndicator.classList.add('hidden') 	// Hide loading

	messageDocs.forEach( (messageDoc, index, docs) => {

		if( messageDoc._id === docs[0]._id ) return addMessage(messageDoc, {
			yours: 'rounded-br-none',
			theirs: 'rounded-bl-none',
		})
		if( messageDoc._id === docs[docs.length - 1]._id ) return addMessage(messageDoc, {
			yours: 'rounded-tr-none',
			theirs: 'rounded-tl-none',
		})

		addMessage(messageDoc, {
			yours: 'rounded-r-none',
			theirs: 'rounded-l-none',
		})
	})

	scrollToBottom()
}



const scrollToBottom = (isFromBegining=true, speed=5, delay=1) => {
	const messageContainerHeight = messageContainer.scrollHeight
	let height = isFromBegining ? 0 : sendMessageForm.offsetTop - 200

	// console.log(sendMessageForm.offsetTop)
	// console.log(messageContainer.offsetTop)

	const frame = () => {
		if( height >= messageContainerHeight ) return clearInterval( timer )
		
		window.scrollTo(0, height)
		height += speed
	}
	clearInterval( timer )
	timer = setInterval(frame, delay)
}


// fetch chats in server-side in /authController.chatMessagePage not here
const getChatById = async (chatId) => {
	const { data, error } = await axios({ url: `/api/chats/${chatId}`, method: 'GET' })
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'getChatById failed',
			action: true,
		})

		return console.log(`getChatById  failed: ${error.message}`)
	}

	const chat = data.data
	editChat.textContent = data?.data.name || 'Group Name'
	// console.log(data.data)

	const threshold = 3
	if(chat.users.length >= threshold) {

		const remainingUsers = chat.users.length - threshold
		if(remainingUsers) {
			$('[name=more-image-placeholder]').textContent = `+${remainingUsers}`
		}

		chat.users.length = threshold 	// limit users

	}


	chat.users
		.filter( user => user._id !== logedInUser._id )
		.forEach( (user, index) => {
		const htmlString = `
			<img src='${user.avatar}' class='z-[${-index}]' />
		`
		imageContainer.insertAdjacentHTML('beforeend', htmlString)
	})


}





dialogSubmitButton.disabled = true
groupName.value = ''

const closeHandler = () => {
	groupName.value = ''
	dialog.close()
	dialogSubmitButton.disabled = true
}

dialogCloseButton.addEventListener('click', closeHandler)
dialogCancelButton.addEventListener('click', closeHandler)
groupName.addEventListener('input', (evt) => dialogSubmitButton.disabled = !evt.target.value.trim() )
editChat.addEventListener('click', () => dialog.showModal())

dialogSubmitButton.addEventListener('click', async (evt) => {
	const url = new URL(location.href)
	const chatId = url.pathname.split('/').pop()
	
	const { error, data } = await axios({
		url: `/api/chats/${chatId}`,
		method: 'PATCH',
		data: { name: groupName.value, isGroup: true }
	})
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'show update groupName failed',
			action: true,
		})

		return console.log(`show update groupName  failed: ${error.message}`)
	}

	editChat.textContent = data?.data.name || 'Group Name'

	// console.log( data.data )
	closeHandler()
})

// 2. Send Message by button Click
sendButton.addEventListener('click', (evt) => {
	let message = sendInput.value.trim()
			message = encodeHTML(message)
	if( !message ) return

	sendMessageToBackend(message)
})

// 1. Send Message by pressing enteredKey 
sendInput.addEventListener('keydown', (evt) => {
	const enteredKey = 13

	clearTimeout(timer)
	const message = evt.target.value.trim()
	sendTypingEvent(chatId, message)

	timer = setTimeout(() => {
		const isPressedEnteredKey = evt.keyCode === enteredKey

		let message = evt.target.value.trim()
				message = encodeHTML(message)

		if( !message ) return

		if(isPressedEnteredKey) sendMessageToBackend(message)
	}, 0)
})

const sendMessageToBackend = async ( message ) => {
	message = encodeHTML(message)
	if(!message.trim()) return console.log('Your message is empty')

	/* Note: chatId can be 
			1. chatId  	: will be chatId if it is group chat
			2. chatId  	: will be userId if it is not group chat, but user-to-user chat
	
			So in backend we also have to handle those senerio */ 
	const { data, error } = await axios({
		url: '/api/messages',
		method: 'POST',
		data: { message, sender: logedInUser._id, chat: chatId }
	})

	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'add message failed',
			action: true,
		})

		return console.log(`add message  failed: ${error.message}`)
	}
	
	const messageDoc = data.data
	sendInput.value=''
	sendInput.focus()

		
	sendingNewMessageEvent(chatId, messageDoc)
	addMessage(messageDoc)
	updateMessageBadge()
}


const addMessage = (currentDoc, classList={} ) => {
	const logedInUserId = logedInUser._id 		// comes from global variable
	const sender = currentDoc.sender
	const currentSenderId = currentDoc.sender._id

	const isOurMessages = currentSenderId === logedInUserId
	const className = currentSenderId === logedInUserId ? classList.yours : classList.theirs


	const thierMessage = `
		<div class='my-1 flex items-end gap-2 '>
			<img src='${sender.avatar}' class='w-6 h-6 rounded-full' />
			<p class='max-w-sm inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded-lg'>
				<span class='${className}'> ${decodeHTML(currentDoc.message)} </span>
			</p>
		</div>
	`
	const myMessage = `
		<div class='flex justify-end'>
			<p class='my-1 max-w-sm inline-block bg-blue-500 text-slate-50 px-3 py-1.5 rounded-lg '>
				<span class=' ${className}'> ${decodeHTML(currentDoc.message)} </span>
			</p>
		<div>
	`

	if(!currentSenderId) return console.log('make sure messageDoc.sender is populated ')

	const htmlString = isOurMessages ? myMessage : thierMessage
	messageContainer.insertAdjacentHTML('beforeend', htmlString)
	scrollToBottom(false, 1)
}


/* We got message page via <a href='/message/chatId'>
		So soon as we comes to message details page, that means
		we are in group chat  (or if comes with user._id then private chat) */ 
joinUserByChatId(chatId)
export const onJoinSussess = ({ error, message }) => {
	if(error) console.log(error)
	console.log(`show in UI instead of log: `, message)
}

export const showTypingIndicatorInUI = (chatId, message) => {
	clearTimeout(timer)
	typingIndicator.style.display = 'block'

	timer = setTimeout(() => {
		typingIndicator.style.display = 'none'
	}, 3000);
}


/* We send message-received to every users so we have to handle this even globally
		so we have 2 secition
			1. if user exists in chat room then add the chat message on chat container
			2. if user outside of chat room then show Alert that new messages comes.

		Handle 1st senario here, and another on socket page or utils.js page which is globally available
*/ 
export const handleMessageReceiveUI = (roomId, messageDoc) => {
	addMessage(messageDoc)
	typingIndicator.style.display = 'none'
	sendInput.value=''
	sendInput.focus()

	updateMessageBadge() 	// comes from utils.js
}

deleteChatButton.addEventListener('click', async (evt) => {
	
	const userId = logedInUser._id

	const { error } = await axios({
		url: `/api/messages/${userId}`,
		method: 'DELETE'
	})

	if(error) return Snackbar({
		severity: 'error',
		variant: 'filled',
		message: error.message || 'deleteding all messages by userId is failed',
		action: true,
	})

	// messageContainer.innerHTML = ''
})