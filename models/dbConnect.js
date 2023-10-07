const { connect, connection } = require('mongoose')

const { NODE_ENV, DB_LOCAL_URL, DB_REMOTE_URL } = process.env
const DATABASE = NODE_ENV === 'production' ? DB_REMOTE_URL : DB_LOCAL_URL

const dbConnect = async () => {
	try {
		if(connection.readyState >= 1) return
		const conn = await connect(DATABASE)	
		const { host, port, name } = conn.connection
		console.log(`---- Database connected to : [${host}:${port}/${name}]----` )

	} catch (err) {
		console.log(`database connection failed: ${err.message}`)
	}
}

module.exports = dbConnect