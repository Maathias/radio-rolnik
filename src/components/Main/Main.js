import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from 'react-router-dom'
import { useState } from 'react'

import Nav from '../Nav/Nav'
import History from '../History/History'
import Status from '../Status/Status'
import Info from '../Info/Info'
import Top from '../Top/Top'
import Search from '../Search/Search'

import { get } from '../../Cache'

import PlayingContext from '../../contexts/Playing'

import './Main.css'

document.setTitle = (prefix, suffix) => {
	document.title = `${prefix} | ${suffix ?? 'radio-rolnik'}`
}

function Main() {
	let [playing] = useState({
		...get('2340q8ghedsnawg1'),
	})

	return (
		<PlayingContext.Provider value={playing}>
			<div className="main">
				<Router>
					<Switch>
						<Route exact path="/">
							<History
								next={get('8034thrgnu0380')}
								tracks={[get('2340q8ghedsnawg1'), get('8034thrgnu0380')]}
							/>
						</Route>

						<Route path="/utwor/:id">
							<Info />
						</Route>

						<Route path="/top">
							<Top tracks={[get('2340q8ghedsnawg1'), get('8034thrgnu0380')]} />
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
								to: `/utwor/${playing.id}`,
								icon: 'info',
							},
							{ label: 'Ustawienia', to: '/ustawienia', icon: 'cog-alt' },
						]}
					/>
					<Status />
				</Router>
			</div>
		</PlayingContext.Provider>
	)
}

export default Main
