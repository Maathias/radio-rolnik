import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from 'react-router-dom'

import Nav from '../Nav/Nav'
import History from '../History/History'
import Status from '../Status/Status'

import { get } from '../../Cache'

import './Main.css'
import Info from '../Info/Info'

var playing = get('2340q8ghedsnawg1')

function Main() {
	return (
		<div className="main">
			<Router>
				<Switch>
					<Route exact path="/">
						<History
							next={get('8034thrgnu0380')}
							playing={playing}
							tracks={[get('2340q8ghedsnawg1'), get('8034thrgnu0380')]}
						/>
					</Route>
					<Route path="/utwor/:id">
						<Info playing={playing} />
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
				<Status track={playing} progress=".75" />
			</Router>
		</div>
	)
}

export default Main
