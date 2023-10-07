require('dotenv').config()
const app = require('./app')

const dbConnect = require('./models/dbConnect')

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	console.log(`server running on http://localhost:${PORT} - ${process.env.NODE_ENV}`)
	dbConnect()
})
