import { createRef, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import Track from '../Track/Track'
import { getMultiple, search } from '../../Cache'

import './Search.css'

function Search() {
	const { query } = useParams(),
		[results, setResults] = useState([]),
		[meta, setMeta] = useState(''),
		input = createRef()

	let timeout

	function run(query) {
		query = query.trim()
		if (query.length < 1) return

		setMeta(`Wyszukiwanie...`)

		search(query)
			.then(({ tracks, total }) => {
				getMultiple(tracks)
					.then((tracks) => {
						setResults(tracks)
						setMeta(`Znaleziono ${total} utworów`)
					})
					.catch((err) => {
						setMeta(`Wystąpił błąd podczas pobierania utworów`)
					})
			})
			.catch((err) => {
				setMeta(`Wystąpił błąd podczas wyszukiwania`)
			})
	}

	document.setTitle(query ? `"${query}"` : 'Wyszukaj')

	useEffect(() => {
		if (input.current.value !== '') {
			run(input.current.value)
		}

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
				ref={input}
				onChange={(e) => {
					clearTimeout(timeout)
					timeout = setTimeout(() => run(e.target.value), 500)
				}}
				onKeyPress={(e) => {
					clearTimeout(timeout)
					if (e.key === 'Enter') run(e.target.value)
				}}
			/>
			<div className="search-results">
				{meta && (
					<span className="search-meta">
						<i className="icon-align-left"></i>&nbsp;
						{meta}
					</span>
				)}
				{results.map((track) => {
					return <Track key={track.id} {...track} />
				})}
			</div>
		</div>
	)
}

export default Search
