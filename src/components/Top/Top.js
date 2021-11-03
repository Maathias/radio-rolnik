import { useState } from 'react'
import { getMultiple } from '../../Cache'
import Track, { Tracklist } from '../Track/Track'

import './Top.css'

function Top({ tracks, timestamp }) {
	const locale = 'pl-PL',
		date = timestamp ?? new Date(),
		weekName = date.toLocaleDateString(locale, { weekday: 'long' }),
		day = date.toLocaleTimeString(locale, {
			hour: '2-digit',
			minute: '2-digit',
		}),
		limit = 25

	const [more, setMore] = useState(0)

	getMultiple(tracks.slice(0, limit + more))

	return (
		<div className="wrapper top">
			<span className="top-header">
				TOP: {weekName} {timestamp ? day : '-'}
			</span>

			<Tracklist>
				{tracks.slice(0, limit + more).map((tid, i) => {
					return <Track key={tid} tid={tid} rank={i + 1} />
				})}
			</Tracklist>

			{tracks.length - limit - more > 0 && (
				<div
					className="top-more"
					onClick={(e) => {
						setMore((m) => m + 10)
					}}
				>
					Pokaż więcej ({tracks.length - limit - more})
				</div>
			)}
		</div>
	)
}

export default Top
