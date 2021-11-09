import ky from 'ky'
import { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router'

import { promptLogin, credentials, clearCredentials } from '../../Auth'

import SettingsContext from '../../contexts/Settings'

import Modal from '../Modal/Modal'

import './Settings.css'

function checkCode(code) {
	return ky
		.get(`/api/code/info/${code}`, {
			headers: { authorization: credentials.token },
		})
		.json()
}

function claimCode(code) {
	return new Promise((resolve, reject) => {
		ky.post(`/api/code/claim/${code}`, {
			headers: { authorization: credentials.token },
		})
			.json()
			.then((ok) => {
				resolve(ok)
			})
	})
}

function listCodes() {
	return ky
		.get(`/api/code/list`, {
			headers: { authorization: credentials.token },
		})
		.json()
}

const defaults = {
	hueFromArt: true,
}

function CodeListing({ code: { value, type, used } }) {
	return (
		<div className="settings-sub plain">
			<span>
				<b>{value}</b> - {type}
			</span>
			<i className={used ? 'icon-star-empty' : 'icon-star'}></i>
		</div>
	)
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
	const [creds, setCreds] = useState({ ...credentials }),
		[code, setCode] = useState(null),
		[modalCode, setModalCode] = useState(false),
		[codes, setCodes] = useState([])

	useEffect(() => {
		if (credentials.token) {
			listCodes().then((list) => setCodes(list))
		}
	}, [])

	const { search } = useLocation()

	useEffect(() => {
		let params = new URLSearchParams(search),
			c = params.get('c')

		if (c) {
			checkCode(c)
				.then((info) => {
					setCode(info)
					setModalCode(true)
				})
				.catch((err) => console.error(err))
		}
	}, [search])

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
					<b>Zaloguj się</b> aby móc głosować na utwory
				</div>
			)}

			{codes.length > 0 && (
				<div className="settings-part body">
					<span>Zebrane kody: </span>
					{codes.map((code) => (
						<CodeListing code={code} />
					))}
				</div>
			)}

			{modalCode && (
				<Modal>
					<div className="modal-title">Znalazłeś kod do aktywacji!</div>
					<div className="modal-body">
						<p>
							Kod "{code.value}" jest
							<b> {code.claimed ? 'Zajęty 😥' : 'Wolny 😁'}</b>.<br />
						</p>
						{!credentials.token && <p>Zaloguj się aby móc go zająć.</p>}
						Kod typu
						<i> {code.type}</i>: {code.desc}
					</div>
					<div className="modal-buttons">
						<button
							onClick={() => setModalCode(false)}
							className="modal-button"
						>
							Zamknij
						</button>
						{!code.claimed && credentials.token && (
							<button
								onClick={() => {
									setModalCode(false)
									claimCode(code.value).then((ok) => {
										listCodes().then((list) => setCodes(list))
									})
								}}
								className="modal-button"
							>
								Zajmij
							</button>
						)}
					</div>
				</Modal>
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
