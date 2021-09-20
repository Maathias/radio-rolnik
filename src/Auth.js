import Jwt from 'jsonwebtoken'
import localStorage from 'local-storage'

const appId = '299948451430584',
	redirectUri = `https://radio.rolniknysa.pl/api/login/token`,
	state = 'stejt'

var credentials = {
	token: localStorage('token') ?? '',
	udata: localStorage('udata') ?? {},
}

function promptLogin() {
	return new Promise((resolve, reject) => {
		let popup = window.open(
			`https://www.facebook.com/v11.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${state}`,
			`Zaloguj się przez Facebook`,
			`scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=400,height=550`
		)
		window.exit = ({ jwt }) => {
			popup.close()

			credentials = {
				token: jwt,
				udata: Jwt.decode(jwt),
			}

			localStorage('token', credentials.token)
			localStorage('udata', credentials.udata)

			resolve(credentials)
		}
	})
}

function clearCredentials() {
	return new Promise((resolve, reject) => {
		credentials = {
			token: '',
			udata: {},
		}

		localStorage('token', credentials.token)
		localStorage('udata', credentials.udata)

		resolve(credentials)
	})
}

export { promptLogin, clearCredentials, credentials }
