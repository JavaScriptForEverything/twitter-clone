import { timeSince, decodeHTML } from '/js/module/utils.js'

export const getTweetHTML = (tweet, logedInUser, { isModal=false, showIcons=true, showPinLabel=true } = {}) => {
	if( !tweet ) return console.log('tweet doc is empty ')
	if( !logedInUser ) return console.log('logedInUser missing in getTweetHTML component')

	const isRetweetedByUser = logedInUser.retweets.includes(tweet._id)
	const isLovedByUser = tweet.likes.includes(logedInUser._id)
	const isLogedInUser = tweet.user._id === logedInUser._id

	if(!tweet) return console.log('tweet object not found')
	if(!tweet.user?._id) return console.log(`{tweet.user} not populated`)

		// ${isModal ? '' : "<hr class='mb-4' />" }

	return `<div class='tweet-container border-b border-slate-200' id=${tweet._id}>

		${tweet.retweet ?  `
			<h2 
				class='mt-2 mb-1 text-slate-600 hover:text-slate-700 px-4 text-xs font-medium uppercase'
			>
				REPOTED BY : @${tweet.user.username}
			</h2>

		` : '' }

		<div class='px-4 py-2 text-slate-700 flex gap-4'>
			<img
				src=${tweet.user.avatar}
				alt=${tweet.user.avatar}
				class='${isModal ? 'w-8 h-8 ' : 'w-12 h-12 rounded-full border border-blue-500 shadow-md p-0.5'}' 
			/>

			<div name='pin-label-container' class='[&>button]:mt-2 flex-1'>
				${tweet.pinned && showPinLabel ? `
					<div name='pin-label' class='flex gap-0.5 items-center mb-0.5 text-slate-500'>
						<svg class='w-3 h-3' xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479c-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A5.921 5.921 0 0 1 5 6.708V2.277a2.77 2.77 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354z"/></svg>
						<span class='text-xs'> Pinned Tweet </span>
					</div>` : '' }

				<div class='flex gap-0.5 items-center'>
					<div class='flex gap-2 text-slate-700 hover:text-slate-900 cursor-pointer'>
						<a href="/profile/${tweet.user.username}" title='/profile/${tweet.user.username}'>
							<p class='profile hover:underline hover:decoration-dotted text-blue-600 whitespace-nowrap' > ${tweet.user.firstName} ${tweet.user.lastName}</p> 
						</a>
						<a href="/tweet/${tweet._id}" title='/tweet/${tweet._id}'>
							<p class='redirect'> @${tweet.user.username} </p> 
						</a>
						<a href="/tweet/${tweet._id}" title='/tweet/${tweet._id}'>
							<p class='redirect w-20 truncate'>${timeSince(new Date(tweet.createdAt))}</p> 
						</a>
					</div>

					${isModal ? '' : isLogedInUser ? `
							<button id='pin-button' name='pin-button' type='button' 
							class='${tweet.pinned ? 'active': ''} disabled:hover:bg-transparent ml-auto ${tweet.pinned ? 'text-slate-500 ' : 'text-slate-50 stroke-slate-600'} hover:bg-slate-200 p-1 rounded-full active:bg-slate-300' >
								<svg class='w-3 h-3  pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479c-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A5.921 5.921 0 0 1 5 6.708V2.277a2.77 2.77 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354z"/></svg>
							</button>
							<button id='delete-button' name='delete-button' type='button' class='disabled:hover:bg-transparent text-slate-600 hover:bg-slate-200 p-1 rounded-full active:bg-slate-300' >
								<svg class='w-3 h-3 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07zM11.4 10l2.83-2.83l-1.41-1.41L10 8.59L7.17 5.76L5.76 7.17L8.59 10l-2.83 2.83l1.41 1.41L10 11.41l2.83 2.83l1.41-1.41L11.41 10z"/></svg>
							</button>
						`: ''
					}
				</div>

				${tweet.replyTo?.user ? `
				<p class='text-xs mb-2'>
					<span>Repling To</span>
					<span class='text-blue-700'>@${tweet.replyTo.user.username}</span>
				</p> ` :''}

				<p class='text-slate-600 text-sm'> ${decodeHTML(tweet.tweet || 'no message')}</p> 

				${showIcons ? `
				<div class='mt-3 pointer-events-none'>
					<div id="actions" class="pointer-events-none flex justify-between items-center gap-2 mb-1 mt-3 text-slate-600">
						<button name='chat-button' class="pointer-events-auto flex items-center gap-1" type="button" id="chat">
							<svg class='pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024"><path fill="currentColor" d="m174.72 855.68l130.048-43.392l23.424 11.392C382.4 849.984 444.352 864 512 864c223.744 0 384-159.872 384-352c0-192.832-159.104-352-384-352S128 319.168 128 512a341.12 341.12 0 0 0 69.248 204.288l21.632 28.8l-44.16 110.528zm-45.248 82.56A32 32 0 0 1 89.6 896l56.512-141.248A405.12 405.12 0 0 1 64 512C64 299.904 235.648 96 512 96s448 203.904 448 416s-173.44 416-448 416c-79.68 0-150.848-17.152-211.712-46.72l-170.88 56.96z"/></svg>
							<span class="pointer-events-none">${''}</span>
						</button>
						<button name='retweet-button' class="${isRetweetedByUser ? 'text-blue-600': ''} pointer-events-auto flex items-center gap-1" type="button" id="retweet">
							<svg class='pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024"><path fill="currentColor" d="M136 552h63.6c4.4 0 8-3.6 8-8V288.7h528.6v72.6c0 1.9.6 3.7 1.8 5.2a8.3 8.3 0 0 0 11.7 1.4L893 255.4c4.3-5 3.6-10.3 0-13.2L749.7 129.8a8.22 8.22 0 0 0-5.2-1.8c-4.6 0-8.4 3.8-8.4 8.4V209H199.7c-39.5 0-71.7 32.2-71.7 71.8V544c0 4.4 3.6 8 8 8zm752-80h-63.6c-4.4 0-8 3.6-8 8v255.3H287.8v-72.6c0-1.9-.6-3.7-1.8-5.2a8.3 8.3 0 0 0-11.7-1.4L131 768.6c-4.3 5-3.6 10.3 0 13.2l143.3 112.4c1.5 1.2 3.3 1.8 5.2 1.8c4.6 0 8.4-3.8 8.4-8.4V815h536.6c39.5 0 71.7-32.2 71.7-71.8V480c-.2-4.4-3.8-8-8.2-8z"/></svg>
							<span class="pointer-events-none">${tweet.retweetUsers.length || ""}</span>
						</button>
						<button name='heart-button' class="${isLovedByUser ? 'text-blue-600': ''} pointer-events-auto mr-10 flex items-center gap-1" type="button" id="heart">
							<svg class='pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="currentColor" d="M178 32c-20.65 0-38.73 8.88-50 23.89C116.73 40.88 98.65 32 78 32a62.07 62.07 0 0 0-62 62c0 70 103.79 126.66 108.21 129a8 8 0 0 0 7.58 0C136.21 220.66 240 164 240 94a62.07 62.07 0 0 0-62-62Zm-50 174.8C109.74 196.16 32 147.69 32 94a46.06 46.06 0 0 1 46-46c19.45 0 35.78 10.36 42.6 27a8 8 0 0 0 14.8 0c6.82-16.67 23.15-27 42.6-27a46.06 46.06 0 0 1 46 46c0 53.61-77.76 102.15-96 112.8Z"/></svg>
							<span class="pointer-events-none">${tweet.likes.length || ""}</span>
						</button>
					</div>
				</div>
				` : ''}

			</div>
		</div>
	</div>`

}

