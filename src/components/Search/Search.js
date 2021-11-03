import { createRef, useEffect, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import Track, { Tracklist } from '../Track/Track'
import { getMultiple, search } from '../../Cache'

import './Search.css'

var timeout

function Search() {
	const { query } = useParams(),
		[results, setResults] = useState([]),
		[meta, setMeta] = useState(''),
		input = createRef(),
		history = useHistory()

	function run(query) {
		query = query.trim()
		if (query.length < 1) return

		setMeta(`Wyszukiwanie...`)

		history.replace(`/wyszukaj/${query}`)

		search(query)
			.then(({ tids, total, elapsed }) => {
				getMultiple(tids)
				setResults(tids)
				setMeta(
					`Znaleziono ${total} utworów (${(
						elapsed[0] +
						elapsed[1] / 1e9
					).toPrecision(2)}s)`
				)
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
		<div className="wrapper search" data-results={results.length}>
			<h2>Wyszukaj utwór</h2>
			<input
				className="search-input"
				placeholder="Wyszukaj utwór"
				type="text"
				defaultValue={query}
				ref={input}
				onChange={(e) => {
					clearTimeout(timeout)
					timeout = setTimeout(() => run(e.target.value), 1e3)
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
				<Tracklist>
					{results.map((tid) => {
						return <Track key={tid} tid={tid} />
					})}
				</Tracklist>
			</div>
		</div>
	)
}

export default Search
