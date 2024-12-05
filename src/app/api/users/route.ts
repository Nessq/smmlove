import { db } from '@/lib/db'
import { users } from '@/entities/user/schema'

export async function GET(request: Request) {
	const database = await db
	const data = await database.select().from(users).execute()

	return Response.json(data)
}
