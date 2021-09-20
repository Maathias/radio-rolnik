import { useState } from 'react/cjs/react.development'
import { promptLogin, credentials, clearCredentials } from '../../Auth'

import './Settings.css'

function Toggle({ value }) {
	return (
		<div className="toggle">
			<i className={`icon-toggle-${value ? 'on' : 'off'}`}></i>
		</div>
	)
}

function SettingToggle({ children, defaultValue }) {
	const [value, setValue] = useState(defaultValue ?? false)
	return (
		<div
			className="settings-toggle"
			data-value={value}
			onClick={() => setValue((value) => !value)}
		>
			{children}
			<Toggle value={value} />
		</div>
	)
}

function Settings() {
	const [creds, setCreds] = useState({ ...credentials })

	return (
		<div className="wrapper settings">
			<div className="head">
				<img
					src={
						creds.token
							? `https://graph.facebook.com/${creds.udata.id}/picture?type=square`
							: '/media/default_profile.png'
					}
					alt="user profile pic"
				/>

				<span>{creds.udata.name ?? '-- --'}</span>
				<div
					onClick={() => {
						creds.token
							? clearCredentials().then((newCreds) => setCreds(newCreds))
							: promptLogin().then((newCreds) => setCreds(newCreds))
					}}
				>
					{creds.token ? 'wyloguj' : 'zaloguj'}
				</div>
			</div>

			{creds.token ? null : (
				<div className="settings-part body">
					<strong>Zaloguj się</strong> aby móc głosować więcej niż na jeden
					utwór
				</div>
			)}

			<div className="settings-part">
				<SettingToggle defaultValue={false}>
					Ustawiaj kolorystyke strony na podstawie okładki albumu
				</SettingToggle>
				<SettingToggle>Lorem ipsum dolor sit amet</SettingToggle>
			</div>

			{/* Terms of Service and other usefull links */}
			<div className="settings-part">
				<a href="/tos.html" target="_blank" className="settings-toggle">
					Regulamin korzystania ze strony <i className="icon-export"></i>
				</a>
				<a href="/privacy.html" target="_blank" className="settings-toggle">
					Zasady prywatności (RODO) <i className="icon-export"></i>
				</a>
			</div>
		</div>
	)
}

export default Settings
