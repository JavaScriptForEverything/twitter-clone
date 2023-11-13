const chatListContainer = $('[name=chat-list-container]')

// console.log(logedInUser)

const getAllChats = async () => {
	const { data, error } = await axios({ url: '/api/chats', method: 'GET' })
	if(error) return console.log(`getAllChats error: ${error.message}`)

	const chats = data.data
	chats?.forEach( (chat) => {
		showChat(chat, chatListContainer, logedInUser)
	})
}
getAllChats()



const showChat = (chat={}, elementContainer, logedInUser) => {
	const filteredUsernames = chat.users
		.filter(user => user._id !== logedInUser._id) 				// filter out self (user self sees the chants)
		.map( user => `${user.firstName} ${user.lastName}`) 	// 

	const filteredImages = chat.users
		.filter(user => user._id !== logedInUser._id) 				// filter out self (user self sees the chants)
		.map( user => user.avatar ) 

	
	
	const	primary= chat.name || filteredUsernames.join(', ') || 'Group Chat'
	const	secondary='Secondary Text'
	const images = filteredImages || []
	const	icon= ''
	const	isHover= false
	const	id=''
	const	name='list-container'

	const isMultipleImages = images.length > 1
	

	const htmlString = `
		<a href='/message/${chat._id}'>
			<div
				class='group border-b border-slate-200 px-3 py-1.5 rounded-sm bg-slate-50 '
				class=${isHover ? 'hover:bg-slate-100 active:bg-slate-200' : ''}
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

				</div>
			</div>
		</a>

	`					

	elementContainer.insertAdjacentHTML('beforeend', htmlString)
}