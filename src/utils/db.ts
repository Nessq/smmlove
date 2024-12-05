import { drizzle } from 'drizzle-orm/planetscale-serverless'
import { Client } from '@planetscale/database'

const client = new Client({
	url: process.env.DATABASE_URL
})

export const db = drizzle(client)

// const connectToDatabase = async () => {
// 	const connection = await mysql.createConnection({
// 		host: process.env.DATABASE_HOST,
// 		user: process.env.DATABASE_USERNAME,
// 		password: process.env.DATABASE_PASSWORD,
// 		database: process.env.DATABASE_NAME,
// 		port: Number(process.env.DATABASE_PORT)
// 	})
//
// 	return drizzle(connection)
// }
//
// export const db = connectToDatabase()
