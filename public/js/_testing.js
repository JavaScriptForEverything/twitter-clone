const getAllTweets = async () => {
	
	const { data, error } = await axios({
		url: '/api/messages',
	})

	if(error) return console.log(error)
	// console.log(data)
	
	const tweets = data.data 
	const filteredObject = tweets.map( tweet => ({
		...tweet,
		// _id: tweet._id,
		// user: tweet.user._id,
		// retweet: tweet.retweet._id,
	}))

	$('#root').innerHTML = `
		<pre>
			${JSON.stringify(filteredObject, null, 2)}
		</pre>
	`
}
getAllTweets()


const htmlstring = `
	<button class='text-red-500'>
		Hi Button
	</button>
`
$('#root').insertAdjacentHTML('beforebegin', htmlstring)