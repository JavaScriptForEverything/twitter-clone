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

const chatId = location.pathname.split('/').pop()

const getAllMessagesOfSingleChat = async (chatId) => {
	const { data, error } = await axios({
		url: `/api/chats/${chatId}/messages`,
		method: 'GET'
	})
	if(error) return console.log(`fetch all messages failed: ${error.message}`)

	const messageDocs = data.data


	// const firstDoc = messageDocs[0]
	// const lastDoc  = messageDocs[messageDocs.length - 1]

		// <div name='message-container' class='p-2 text-slate-500'>
		// 	<p class='text-slate-500/80 text-sm'> ${sender.firstName} ${sender.lastName} </p>
		// </div>
	
	const mineMessageDoc = messageDocs.find( mineDoc => mineDoc._id === logedInUser._id)
	messageContainer.insertAdjacentHTML('afterbegin', '<span> hi </span>')

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
	let timer
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


sendMessageForm.addEventListener('submit', async (evt) => {
	evt.preventDefault()


	const url = new URL(location.href)
	const chatId = url.pathname.split('/').pop()

	const formData = new FormData(evt.target)

	const message = formData.get('send-input')
	if(!message.trim()) return console.log('Your message is empty')



	const { data, error } = await axios({
		url: '/api/messages',
		method: 'POST',
		data: {
			message: encodeHTML(message),
			sender: logedInUser._id,
			chat: chatId,
			// users: [{ type: Schema.Types.ObjectId, ref: 'User' }], 	// => readBy
		}
	})

	if(error) {
		sendInput.value = message
		console.log(`POST /api/messages: ${error.message}`)
		return
	}
	// console.log(data.data)
	addMessage(data.data)
	sendInput.value=''
	sendInput.focus()
})


	// const lastMessageDoc = messageDocs[messageDocs.length - 1]
	// if(!lastMessageDoc.sender._id) return console.log('message.sender is not populated')
	// const lastSenderId = lastMessageDoc.sender._id

const addMessage = (currentDoc, classList={} ) => {
	const logedInUserId = logedInUser._id 		// comes from global variable
	const sender = currentDoc.sender
	const currentSenderId = currentDoc.sender._id

	const isOurMessages = currentSenderId === logedInUserId
	const className = currentSenderId === logedInUserId ? classList.yours : classList.theirs


	const thierMessage = `
			<div class='my-1 flex items-end gap-2 '>
				<img src='${sender.avatar}' class='w-6 h-6 rounded-full' />
				<p class='w-2/3'>
					<span class=' bg-slate-100 text-slate-600 px-2 py-1 rounded-lg ${className} '>${currentDoc.message}</span>
				</p>
			</div>
	`
	const myMessage = `
		<div class='my-1 flex justify-end items-center gap-2 '>
			<p class='w-2/3'>
				<span class=' bg-blue-500 text-slate-50 px-2 py-1 rounded-lg ${className}' >${currentDoc.message}</span>
			</p>
		</div>
	`

	if(!currentSenderId) return console.log('make sure messageDoc.sender is populated ')

	const htmlString = isOurMessages ? myMessage : thierMessage
	messageContainer.insertAdjacentHTML('beforeend', htmlString)
	scrollToBottom(false, 1)
}



// setTimeout(() => {
// const scrollHeight = messageContainer.scrollHeight
// 	// messageContainer.scrollIntoView({ behavior: "smooth" }) 
// 	window.scrollTo(0, scrollHeight)
// }, 1000)
