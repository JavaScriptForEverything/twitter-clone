import { Snackbar } from '/js/module/components/index.js'
import $, { axios, decodeHTML, stringToElement } from '/js/module/utils.js'

/* Global Variables
		. logedInUser
*/



const chatListContainer = $('[name=chat-list-container]')

// console.log(logedInUser)

const getAllChats = async () => {
	const { data, error } = await axios({ url: '/api/chats' })
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'getAllChats failed',
			action: true,
		})

		return console.log(`getAllChats  failed: ${error.message}`)
	}


	const chats = data.data
	chats?.forEach( (chat) => {
		// console.log(chat)
		showChat(chat, chatListContainer, logedInUser)
	})
}
getAllChats()



// GET 		/api/chats 				: To Show Chat in UI
// DELETE /api/chats/:id
const showChat = (chat={}, elementContainer, logedInUser) => {
	const filteredUsernames = chat.users
		.filter(user => user._id !== logedInUser._id) 				// filter out self (user self sees the chants)
		.map( user => `${user.firstName} ${user.lastName}`) 	// 

	const filteredImages = chat.users
		.filter(user => user._id !== logedInUser._id) 				// filter out self (user self sees the chants)
		.map( user => user.avatar ) 

	const message = chat?.latestMessage?.message
	const sender = chat?.latestMessage?.sender

	const latestMessage = sender ? `${sender.firstName} ${sender.lastName}: ${message}` : ''
	
	const	primary= chat.name || filteredUsernames.join(', ') || 'Group Chat'
	const	secondary= decodeHTML(latestMessage) || 'new message'
	const images = filteredImages || []
	const	icon= ''
	const	isHover= true
	const	id=''
	const	name='list-container'

	const isMultipleImages = images.length > 1
	

	const htmlString = `
		<a href='/message/${chat._id}'>
			<div
				class='group border-b border-slate-200 px-3 py-1.5 rounded-sm bg-slate-50/50 hover:bg-slate-100/80 active:bg-slate-200' 
				id=${id}
				name=${name}
			>
				<div class='flex items-center gap-2'>
					${ isMultipleImages ? `
						<div class='relative w-8 h-8'>
							<img src=${images[0]} alt="${images[0]}" class='absolute -top-1 left-3 w-8 h-8 rounded-full border border-slate-300 ' />
							<img src=${images[1]} alt="${images[1]}" class='absolute top-2 left-0 w-8 h-8 rounded-full border border-slate-300 ' />
						</div>
					` : `
							<img src=${images[0]} alt="avatar" class='w-12 h-12 rounded-full border border-slate-300' />
					` }

					<div class=${ isMultipleImages ? 'ml-4' : ''}>
						<h2 class='text-slate-700 font-medium hover:text-slate-800 truncate w-60'> ${primary} </h2>
						<p class='text-slate-700/95 hover:text-slate-800/90 font-light text-sm'> ${secondary} </p>

						${icon ? `
							<button type='button' name='list-icon' 
								class='ml-auto p-0.5 text-slate-600 rounded-full bg-slate-200 border border-slate-200'
								class='group-hover:bg-slate-300 group-hover:border-slate-300 hover:bg-slate-300 hover:border-slate-300 hover:text-slate-700'
								class='group-active:border-slate-400 active:bg-blue-400 active:border-blue-500 active:text-blue-600'
							> #{icon} </button>
						` : ''}
					</div>

					<button name='close-button' class='ml-auto text-slate-600 p-0.5 bg-slate-200 active:bg-slate-400 hover:bg-slate-300 rounded-full'>
						<svg class='w-3 h-3 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6l-5.6 5.6Z"/></svg>
					</button>

				</div>
			</div>
		</a>
	`					
	// elementContainer.insertAdjacentHTML('beforeend', htmlString)

	const element = stringToElement( htmlString )
	elementContainer.insertAdjacentElement('beforeend', element)

	element.addEventListener('click', async (evt) => {
		if(evt.target.name !== 'close-button') return
		evt.preventDefault()

		// const button = $(`:scope ${element.tagName} [name=close-button]`)
		// console.log(button)

		const { error } = await axios({ url: `/api/chats/${chat._id}`, method: 'DELETE' })
		if(error) {
			Snackbar({
				severity: 'error',
				variant: 'filled',
				message: error.message || 'delete chat failed',
				action: true,
			})

			return console.log(`delete chat  failed: ${error.message}`)
		}

		element.remove()
	})
}
