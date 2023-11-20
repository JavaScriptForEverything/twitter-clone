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

const url = new URL(location.href)
const chatId = url.pathname.split('/').pop()
let timer = undefined

sendInput.value=''


const getAllMessagesOfSingleChat = async (chatId) => {
	const { data, error } = await axios({
		url: `/api/chats/${chatId}/messages`,
		method: 'GET'
	})
	if(error) return console.log(`fetch all messages failed: ${error.message}`)

	const messageDocs = data.data
	pageLoadingIndicator.remove() 	// hide as soon as data loaded


	// const firstDoc = messageDocs[0]
	// const lastDoc  = messageDocs[messageDocs.length - 1]

		// <div name='message-container' class='p-2 text-slate-500'>
		// 	<p class='text-slate-500/80 text-sm'> ${sender.firstName} ${sender.lastName} </p>
		// </div>
	
	// const mineMessageDoc = messageDocs.find( mineDoc => mineDoc._id === logedInUser._id)
	// messageContainer.insertAdjacentHTML('afterbegin', '<span> hi </span>')

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
getAllMessagesOfSingleChat(chatId)


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
	if(error) return console.log(`getChatById error: ${error.message}`)

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
getChatById( chatId )





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
editChat.addEventListener('click', (evt) => dialog.showModal())

dialogSubmitButton.addEventListener('click', async (evt) => {
	const url = new URL(location.href)
	const chatId = url.pathname.split('/').pop()
	
	const { error, data } = await axios({
		url: `/api/chats/${chatId}`,
		method: 'PATCH',
		data: { name: groupName.value, isGroup: true }
	})
	if(error) return console.log(`show update groupName: ${error.message}`)

	editChat.textContent = data?.data.name || 'Group Name'

	// console.log( data.data )
	closeHandler()
})

sendInput.addEventListener('keydown', (evt) => {

	clearTimeout(timer)
	const message = evt.target.value.trim()
	socket.emit('typing', { chatId, message })

	timer = setTimeout(() => {
		const message = evt.target.value.trim()
		if( !message ) return

		if(evt.keyCode === 13) sendMessageToBackend(message)
	}, 0)
})

const sendMessageToBackend = async ( message ) => {
	message = encodeHTML(message)
	if(!message.trim()) return console.log('Your message is empty')

	const { data, error } = await axios({
		url: '/api/messages',
		method: 'POST',
		data: { message, sender: logedInUser._id, chat: chatId }
	})

	if(error) {
		sendInput.value = message
		console.log(`POST /api/messages: ${error.message}`)
		return
	}
	
	const messageDoc = data.data
	sendInput.value=''
	sendInput.focus()
		
	socket.emit('new-message', { chatId, messageDoc })
	addMessage(messageDoc)
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
				<span class='${className}'> ${currentDoc.message} </span>
			</p>
		</div>
	`
	const myMessage = `
		<div class='flex justify-end'>
			<p class='my-1 max-w-sm inline-block bg-blue-500 text-slate-50 px-3 py-1.5 rounded-lg '>
				<span class=' ${className}'> ${currentDoc.message} </span>
			</p>
		<div>
	`

	if(!currentSenderId) return console.log('make sure messageDoc.sender is populated ')

	const htmlString = isOurMessages ? myMessage : thierMessage
	messageContainer.insertAdjacentHTML('beforeend', htmlString)
	scrollToBottom(false, 1)
}


socket.emit('join-room', { chatId })
socket.on('room-joined', ({ roomId: chatId }) => {
	if( !chatId ) return console.log('room-joined failed')
})

socket.on('typing', ({ roomId }) => {
	clearTimeout(timer)
	typingIndicator.style.display = 'block'

	timer = setTimeout(() => {
		typingIndicator.style.display = 'none'
	}, 3000);
})

// socket.on('stop-typing', ({ roomId }) => {
// 	typingIndicator.style.display = 'none'
// })
socket.on('message-received', ({ roomId, messageDoc }) => {
	addMessage(messageDoc)
	typingIndicator.style.display = 'none'
	sendInput.value=''
	sendInput.focus()

})