import { useContext, useState } from 'react'

import { promptLogin, credentials, clearCredentials } from '../../Auth'

import SettingsContext from '../../contexts/Settings'

import './Settings.css'

const defaults = {
	hueFromArt: true,
}

function Toggle({ value }) {
	return (
		<div className="toggle">
			<i className={`icon-toggle-${value ? 'on' : 'off'}`}></i>
		</div>
	)
}

function External({ href, content, target = '_blank' }) {
	return (
		<a href={href} target={target} className="settings-sub external">
			{content} <i className="icon-export"></i>
		</a>
	)
}

function Plain({ content }) {
	return (
		<div className="settings-sub plain">
			{content} <i className="icon-info"></i>
		</div>
	)
}

function SettingToggle({ children, id }) {
	const { settings, setSettings } = useContext(SettingsContext),
		[value, setValue] = useState(settings[id] ?? defaults[id] ?? false)

	return (
		<div
			className="settings-sub toggle"
			data-value={value}
			onClick={() => {
				setValue((value) => !value)
				setSettings(id, value)
			}}
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
					<b>Zaloguj się</b> aby móc głosować więcej niż na jeden utwór
				</div>
			)}

			<div className="settings-part">
				<SettingToggle id="hueFromArt">
					Ustawiaj kolorystyke strony na podstawie okładki albumu
				</SettingToggle>
			</div>

			{/* Terms of Service and other usefull links */}
			<div className="settings-part">
				<External href="/tos.html" content="Regulamin korzystania ze strony" />
				<External href="/privacy.html" content="Zasady prywatności (RODO)" />
			</div>

			<div className="settings-part">
				<Plain
					content={`Autorzy aplikacji: ${[
						'Mateusz Pstrucha',
						'Sebastian Fudalej',
					].join(', ')}`}
				/>
			</div>
		</div>
	)
}

export default Settings
export { defaults }
