const $ = selector => document.querySelector(selector)


const isFormValidated = (obj) => {
	const errorObject = {}

	// if( obj.username && obj.username.length < 4)  errorObj.username = 'name reqired 4 digit long'
	//- if( obj.email && !isEmail(obj.email) ) errorObj.email = 'Invalid Email address' 

	// if(obj.password && obj.password.length < requireLength ) errorObj.password = `Password must be ${requireLength} character long`
	// if(obj.password && obj.confirmPassword && obj.password !== obj.confirmPassword) errorObj.confirmPassword = 'Confirm Password not matched'


	Object.entries(obj).forEach(([key, value]) => {
		if(!value?.trim()) errorObject[key]=`${key} filed is emapty`
	})

	return Object.keys(errorObject).every((field => field == '' ))
}



/*
	createTweet({
		postedBy: '@username',
		avatar: '/images/users/default.jpg',
		fullName: 'Riajul Islam',
		username: 'riajulislam',
		date: '2 month ago',
		message: 'Your message goes here',
		numberOfMessage: 1,
		numberOfRetweet: 0,
		numberOfHeart: 2,
	})
*/
	const createTweet = (props = {}) => {

		const {
			postedBy= '@username',
			avatar= '/images/users/default.jpg',
			fullName= 'Riajul Islam',
			username= 'riajulislam',
			date= '2 month ago',
			message= 'Your message goes here',
			numberOfMessage= 1,
			numberOfRetweet= 0,
			numberOfHeart= 2,
		} = props

		return `<hr class='mb-4' />
			<h2 class='mb-1 text-slate-600 px-3'>Repoted by: ${postedBy}</h2> 
			<div class='p-2 text-slate-700 flex gap-4'>

				<img
					src=${avatar}
					alt=${avatar}
					class='w-12 h-12 rounded-full border border-blue-500 shadow-md p-0.5'
				/>

				<div class='[&>button]:mt-2 flex-1'>

					<div class='flex gap-2 mb-2'>
						<p class='text-slate-700 whitespace-nowrap'> ${fullName} </p> 
						<p class='text-slate-700'> @${username} </p> 
						<p class='text-slate-700 whitespace-nowrap'>${date}</p> 
					</div>

					<p class='text-slate-700 text-sm'> ${message}</p> 
					<div class='mt-3'>


						<nav class='flex justify-between items-center'>

							<div
									class='flex items-center gap-1 [&>svg]:hover:cursor-pointer [&>svg]:w-5 [&>svg]:h-5 [&>svg]:fill-slate-800'
									class='p-1 rounded-full hover:text-blue-600 fill-blue-500 hover:[&>svg]:fill-blue-500 hover:bg-blue-100 '
								>
								<svg id='chat' xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 16 16"><path d="M2.678 11.894a1 1 0 0 1 .287.801a10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6c0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7s-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"></path></svg>
								<span>${numberOfMessage}</span> 
							</div>

							<div
									class='flex items-center gap-1 [&>svg]:hover:cursor-pointer [&>svg]:w-5 [&>svg]:h-5 [&>svg]:fill-slate-800'
									class='p-1 rounded-full hover:text-blue-600 fill-blue-500 hover:[&>svg]:fill-blue-500 hover:bg-blue-100 '
								>
								<svg id='retweet' xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="m5 7l-5 5h4v13h17l-2-2H6V12h4zm4 0l2 2h13v11h-4l5 5l5-5h-4V7z"></path></svg>
								<span>${numberOfRetweet}</span> 
							</div>

							<div 	class='flex items-center gap-1 [&>svg]:hover:cursor-pointer [&>svg]:w-5 [&>svg]:h-5 [&>svg]:fill-slate-800'
										class='p-1 rounded-full hover:text-blue-600 fill-blue-500 hover:[&>svg]:fill-blue-500 hover:bg-blue-100 '
								>
								<svg id='heart' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path d="M178 34c-21 0-39.26 9.47-50 25.34C117.26 43.47 99 34 78 34a60.07 60.07 0 0 0-60 60c0 29.2 18.2 59.59 54.1 90.31a334.68 334.68 0 0 0 53.06 37a6 6 0 0 0 5.68 0a334.68 334.68 0 0 0 53.06-37C219.8 153.59 238 123.2 238 94a60.07 60.07 0 0 0-60-60Zm-50 175.11C111.59 199.64 30 149.72 30 94a48.05 48.05 0 0 1 48-48c20.28 0 37.31 10.83 44.45 28.27a6 6 0 0 0 11.1 0C140.69 56.83 157.72 46 178 46a48.05 48.05 0 0 1 48 48c0 55.72-81.59 105.64-98 115.11Z"></path></svg>
								<span>${numberOfHeart}</span> 
							</div>
						</nav>
					</div>
				</div>
			</div>`
	}