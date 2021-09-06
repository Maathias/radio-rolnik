import { useParams } from 'react-router-dom'

import Track from '../Track/Track'
import { get } from '../../Cache'

import './Search.css'

function Search(props) {
	let { query } = useParams()

	document.setTitle(`"${query}"`)

	return (
		<div className="wrapper search">
			<h2>Wyszukaj utwór</h2>
			<input
				className="search-input"
				placeholder="Wyszukaj utwór"
				type="text"
				defaultValue={query}
			/>
			<div className="search-results">
				{[get('2340q8ghedsnawg1'), get('8034thrgnu0380')].map((track) => {
					return <Track key={track.id} {...track} />
				})}
			</div>
		</div>
	)
}

export default Search
