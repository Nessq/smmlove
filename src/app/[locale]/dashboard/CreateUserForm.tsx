'use client'
import React from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { InputField } from '@/components/ui/InputField'
import { SelectField } from '@/components/ui/SelectField'
import { createUser } from '@/entities/user/actions'
import { UserNewSchema } from '@/entities/user/schema'

export default function CreateUserForm() {
	const onSubmit = async (data: any) => {
		try {
			const { name, email, password, role } = data
			const response = await createUser(name, email, password, role)
			console.log(response)
		} catch (error) {
			console.error(error)
		}
	}
	const methods = useForm()

	const roleOptions = [
		{ label: 'Admin', value: 'admin' },
		{ label: 'User', value: 'user' }
	]

	return (
		<FormProvider {...methods}>
			<form
				onSubmit={methods.handleSubmit(onSubmit)}
				className='space-y-4'
			>
				<InputField
					name='name'
					type='text'
					label='Name'
				/>
				<InputField
					name='email'
					type='email'
					label='Email'
				/>
				<InputField
					name='password'
					type='password'
					label='Password'
				/>
				<SelectField
					name='role'
					label='Role'
					options={roleOptions}
				/>
				<button
					type='submit'
					className='mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
				>
					Create User
				</button>
			</form>
		</FormProvider>
	)
}
