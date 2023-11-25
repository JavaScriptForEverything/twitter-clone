const getAllTweets = async () => {
	
	const { data, error } = await axios({
		url: '/api/users?_fields=email,avatar,-_id,firstName',
		method: 'GET'
	})

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