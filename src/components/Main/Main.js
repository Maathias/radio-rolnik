import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from 'react-router-dom'
import { useEffect, useState } from 'react'
import FastAverageColor from 'fast-average-color'

import Nav from '../Nav/Nav'
import History from '../History/History'
import Status from '../Status/Status'
import Info from '../Info/Info'
import Top from '../Top/Top'
import Search from '../Search/Search'

import { get, getMultiple } from '../../Cache'
import { addEvent } from '../../socket'

import PlayingContext from '../../contexts/Playing'

import './Main.css'

document.setTitle = (prefix, suffix) => {
	document.title = `${prefix} | ${suffix ?? 'radio-rolnik'}`
}

var fac = new FastAverageColor()

function Main() {
	const [playing, setPlaying] = useState({}),
		[elapsed, setElapsed] = useState(0),
		[paused, setPaused] = useState(true),
		[next, setNext] = useState(),
		[previous, setPrevious] = useState([]),
		[top, setTop] = useState([])

	useEffect(() => {
		addEvent('status', ({ trackid, progress, paused }) => {
			get(trackid).then((track) => {
				setPlaying(track)
				setElapsed(progress)
				setPaused(paused)

				fac.getColorAsync(track.album.art).then(({ value: [r, g, b] }) => {
					let color =
						Math.atan2(1.732050808 * (g - b), 2 * r - g - b) * 57.295779513
					document.documentElement.style.setProperty('--deg', color + 'deg')
				})
			})
		})

		addEvent('next', ({ trackid }) => {
			get(trackid).then((track) => {
				setNext(track)
			})
		})

		addEvent('previous', ({ trackids, timestamps }) => {
			getMultiple(trackids).then((tracks) => {
				// insert timestamps to tracks
				tracks.map((track, i) => (track.timestamp = timestamps[i]))
				setPrevious(tracks)
			})
		})

		addEvent('top', ({ trackids }) => {
			getMultiple(trackids).then((tracks) => setTop(tracks))
		})
	}, [])

	return (
		<PlayingContext.Provider value={playing}>
			<div className="main">
				<Router>
					<Switch>
						<Route exact path="/">
							<History next={next} tracks={previous} />
						</Route>

						<Route path="/utwor/:id">
							<Info />
						</Route>

						<Route path="/top">
							<Top tracks={top} />
						</Route>

						<Route path="/wyszukaj/:query?">
							<Search />
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
								to: `/utwor/${playing.id ?? ''}`,
								icon: 'info',
							},
							{ label: 'Ustawienia', to: '/ustawienia', icon: 'cog-alt' },
						]}
					/>
					<Status progress={elapsed} paused={paused} />
				</Router>
			</div>
		</PlayingContext.Provider>
	)
}

export default Main
