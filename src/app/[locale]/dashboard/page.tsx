import CreateUserForm from '@/app/[locale]/admin/CreateUserForm'

export default function AdminPage() {
	return (
		<div>
			<h3>Admin</h3>
			{/* create user form*/}
			<CreateUserForm />
		</div>
	)
}
