import { mysqlTable, serial, timestamp, varchar } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
	id: serial('id').primaryKey().autoincrement(),
	name: varchar('name', { length: 255 }),
	email: varchar('email', { length: 255 }).unique(),
	password: varchar('password', { length: 255 }),
	role: varchar('role', { length: 255 }),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow().onUpdateNow()
})
