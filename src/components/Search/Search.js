import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import Track from '../Track/Track'
import { get, getMultiple, search, tracks } from '../../Cache'

import './Search.css'

function Search(props) {
	const { query } = useParams(),
		[results, setResults] = useState([])
	let timeout

	document.setTitle(`"${query}"`)

	useEffect(() => {
		return () => {
			clearTimeout(timeout)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="wrapper search">
			<h2>Wyszukaj utwór</h2>
			<input
				className="search-input"
				placeholder="Wyszukaj utwór"
				type="text"
				defaultValue={query}
				onChange={(e) => {
					const query = e.target.value

					clearTimeout(timeout)

					timeout = setTimeout(() => {
						search(query).then(({ tracks, total }) => {
							getMultiple(tracks).then((tracks) => setResults(tracks))
						})
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
