import ky from 'ky'

import { credentials } from './Auth'

const admin = {
	ban: (tid) => {
		return ky
			.get(`/api/admin/ban/`, {
				searchParams: { tid },
				headers: { authorization: credentials.token },
			})
			.json()
	},
}

export default admin
