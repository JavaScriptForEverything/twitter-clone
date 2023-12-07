export const getUserHTML = (user, profileUser={}, fieldname = 'following') => {
	const textContent = user?.[fieldname].includes(profileUser._id) ? 'followed' : 'Following'

	return `
		<div name='follow-list' class='border-b border-b-slate-100 py-1.5 flex items-center gap-2 cursor-pointer'>
			<img src='${user.avatar}' alt=user.avatar class='w-10 h-10 rounded-full' />
			<div class='flex-1 flex items-baseline gap-2 text-slate-900'>
				<span class='font-medium'> ${user.firstName} ${user.lastName}</span>
				<span class='text-slate-500 text-sm hover:underline hover:decoration-dashed hover:text-blue-700'> 
					@${user.username}
				</span>
			</div>

			<button type='button' id=user._id name=fieldname
				class='h-8 px-3 py-1.5 rounded-3xl bg-blue-500 text-white font-medium text-sm capitalize'
				class='hover:bg-blue-600 active:bg-blue-700'
			> ${textContent} </button>
		</div>
	`
}
