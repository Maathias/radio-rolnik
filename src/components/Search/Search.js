import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import Track from '../Track/Track'
import { search } from '../../Cache'

import './Search.css'

function Search(props) {
	let { query } = useParams(),
		[results, setResults] = useState([]),
		timeout

	document.setTitle(`"${query}"`)

	useEffect(() => {
		return () => {
			clearTimeout(timeout)
		}
	}, [])

	return (
		<div className="wrapper search">
			<h2>Wyszukaj utwór</h2>
			<input
				className="search-input"
				placeholder="Wyszukaj utwór"
				type="text"
				defaultValue={query}
				onChange={(e) => {
					clearTimeout(timeout)
					timeout = setTimeout(() => {
						setResults(search(e.target.value))
					}, 500)
				}}
			/>
			<div className="search-results">
				{results.map((track) => {
					return <Track key={track.id} {...track} />
				})}
			</div>
		</div>
	)
}

export default Search
