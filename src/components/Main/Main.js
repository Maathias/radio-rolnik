import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
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

import { get, getMultiple, getMultipleStats } from '../../Cache'
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

function usePrevious(value) {
	const ref = useRef()
	useEffect(() => {
		ref.current = value
	})
	return ref.current
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
		[settings, setSettings] = useState(localStorage('settings') ?? defaults),
		prevPlaying = usePrevious(playing)

	useEffect(() => {
		console.log('effect', prevPlaying?.id, playing?.id)
		if (prevPlaying?.id !== playing?.id) {
			if (prevPlaying?.id) {
				setPrevious((prev) => [prevPlaying, ...prev])
			}
		}
		// setPlaying((playing) => {
		// 	console.log(playing, track, playing.id != track.id)
		// 	if (playing.id != track.id) {
		// 		if (playing.id)
		// 	}
		// 	return track
		// })
	}, [prevPlaying, playing])

	useEffect(() => {
		addEvent('status', ({ tid, progress, duration, paused, timestamp }) => {
			get(tid)
				.then((track) => {
					track.timestamp = timestamp // insert timestamp
					console.log('new status')
					setPlaying(track)
					setElapsed([progress, duration])
					setPaused(paused)
				})
				.catch((err) => {
					console.error(err)
					setPaused(true)
				})
		})

		addEvent('next', ({ tid }) => {
			if (tid == null) return setNext(null)
			get(tid)
				.then((track) => {
					setNext(track)
				})
				.catch((err) => console.error(err))
		})

		addEvent('previous', ({ combo, push }) => {
			if (push) {
				return get(push).then((track) =>
					setPrevious((prev) => [track, ...prev])
				)
			}

			let tids = combo.map((pair) => pair[0]),
				timestamps = combo.map((pair) => pair[1])

			getMultiple(tids)
				.then((tracks) => {
					// insert timestamps to tracks
					tracks.map((track, i) => (track.timestamp = timestamps[i]))
					setPrevious(tracks)
				})
				.catch((err) => console.error(err))
		})

		addEvent('top', ({ tids, timestamp }) => {
			Promise.all([getMultiple(tids), getMultipleStats(tids)])
				.then(([tracks, stats]) => {
					tracks.map((track, i) => (track.stats = stats[i]))
					setTop(tracks)
					setTopDate(new Date(timestamp))
				})
				.catch((err) => console.error(err))
		})
	}, []) // eslint-disable-line

	useEffect(() => {
		console.log('settings changed')
		console.log(settings)
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
										<Info />
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
