import localStorage from 'local-storage'

const appId = '299948451430584',
	redirectUri = process.env.REACT_APP_FB_REDIRECTURI,
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

		let interval = setInterval(() => {
			if (popup.closed) {
				credentials = {
					token: localStorage('token'),
					udata: localStorage('udata'),
				}

				resolve(credentials)
				clearInterval(interval)
			}
		}, 500)
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
