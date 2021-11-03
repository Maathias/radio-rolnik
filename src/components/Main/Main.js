import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from 'react-router-dom'
import { useEffect, useState } from 'react'
import ga from 'react-ga'
import localStorage from 'local-storage'

import Nav from '../Nav/Nav'
import History from '../History/History'
import Status from '../Status/Status'
import Info from '../Info/Info'
import Top from '../Top/Top'
import Search from '../Search/Search'
import Settings, { defaults } from '../Settings/Settings'
import Modal from '../Modal/Modal'

import { addEvent } from '../../socket'
import { promptLogin } from '../../Auth'

import PlayingContext from '../../contexts/Playing'
import GaContext from '../../contexts/Ga'
import ModalLoginContext from '../../contexts/ModalLogin'
import SettingsContext from '../../contexts/Settings'

import './Main.css'

ga.initialize('UA-150749288-3')

document.setTitle = (prefix, suffix) => {
	const title = `${prefix} | ${suffix ?? 'radio-rolnik'}`

	// dont repeat same title
	if (document.title === title) return

	document.title = title

	ga.pageview(document.location.pathname)
}

function Main() {
	const [playing, setPlaying] = useState({}),
		[elapsed, setElapsed] = useState([0, 0]),
		[paused, setPaused] = useState(true),
		[next, setNext] = useState(),
		[previous, setPrevious] = useState([]),
		[top, setTop] = useState([]),
		[topDate, setTopDate] = useState(),
		[modalLogin, setModalLogin] = useState(false),
		[settings, setSettings] = useState(localStorage('settings') ?? defaults)

	// set up socket events
	useEffect(() => {
		addEvent('status', ({ tid, progress, duration, paused, timestamp }) => {
			if (tid === null) return
			setPlaying({ tid, timestamp })
			setElapsed([progress, duration])
			setPaused(paused)
		})

		addEvent('next', ({ tid }) => setNext(tid))

		addEvent('previous', ({ combo }) => setPrevious(combo))

		addEvent('top', ({ tids, timestamp }) => {
			setTop(tids)
			setTopDate(new Date(timestamp))
		})
	}, []) // eslint-disable-line

	// save settings on change
	useEffect(() => {
		localStorage('settings', settings)
	}, [settings])

	return (
		<SettingsContext.Provider
			value={{
				settings,
				setSettings: (key, value) => {
					setSettings((settings) => ({ ...settings, [key]: !value }))
				},
			}}
		>
			<ModalLoginContext.Provider value={{ modalLogin, setModalLogin }}>
				<GaContext.Provider value={ga}>
					<PlayingContext.Provider value={playing}>
						<div className="main">
							<Router>
								<Switch>
									<Route exact path="/">
										<History next={next} tracks={previous} paused={paused} />
									</Route>

									<Route path="/utwor/:id?">
										<Info top={top[0]} />
									</Route>

									<Route path="/top">
										<Top tracks={top} timestamp={topDate} />
									</Route>

									<Route path="/wyszukaj/:query?">
										<Search />
									</Route>

									<Route path="/ustawienia">
										<Settings />
									</Route>

									<Route render={() => <Redirect to="/" />} />
								</Switch>
								<Nav
									buttons={[
										{ label: 'Historia', to: '/', icon: 'align-left' },
										{ label: 'Wyszukaj', to: '/wyszukaj', icon: 'search' },
										{ label: 'Top', to: '/top', icon: 'list-numbered' },
										{
											label: 'Utwór',
											path: '/utwor',
											to: `/utwor`,
											icon: 'info',
										},
										{ label: 'Ustawienia', to: '/ustawienia', icon: 'cog-alt' },
									]}
								/>
								<Status progress={elapsed} paused={paused} />
								{modalLogin && (
									<Modal
										title="Zaloguj się aby głosować"
										content="Niestety głosowanie bez logowania nie jest i raczej nie będzie możliwe. Powodowałoby zbyt duży chaos. Logowanie przez facebooka bierze tylko publiczne dane, wyłącznie do autoryzacji"
										buttons={[
											['Zamknij', () => setModalLogin(false)],
											[
												'Zaloguj',
												() => promptLogin().then(() => setModalLogin(false)),
											],
										]}
									/>
								)}
							</Router>
						</div>
					</PlayingContext.Provider>
				</GaContext.Provider>
			</ModalLoginContext.Provider>
		</SettingsContext.Provider>
	)
}

export default Main
