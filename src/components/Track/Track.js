import { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

import './Track.css'
import def from '../../media/default.png'

function Track({ track, timestamp, rank }) {
	const [open, setOpen] = useState(false),
		{
			id,
			title = '-',
			artists = ['-'],
			album = {},
			votes = {},
			cast = '',
		} = track ?? {},
		history = useHistory()

	function vote(value) {
		track
			.setVote(value)
			.then((ok) => ok && setOpen(false))
			.catch((err) => console.error(err))
	}

	function info() {
		history.push(`/utwor/${id}`)
	}

	return (
		<div className={['track', open ? 'open' : ''].join(' ')} id={id}>
			<div
				className={'track-section-a ' + (timestamp || rank ? '' : 'empty')}
				onClick={() => info()}
			>
				{timestamp && <span className="track-timestamp">{timestamp}</span>}
				{rank && <span className="track-rank">{rank}</span>}
				<img className="track-image" src={album.art ?? def} alt="album cover" />
			</div>

			<div className="track-section-b" onClick={() => info()}>
				<span className="track-title">{title}</span>
				<span className="track-artist">{artists.join(', ')}</span>
			</div>

			<div className="track-icons">
				<i
					className="icon-ellipsis-vert"
					onClick={() => {
						setOpen(true)
					}}
				></i>
			</div>
			<div className="track-more">
				<div className="track-more-button">
					<i
						className="icon-thumbs-up"
						data-set={cast === 'up'}
						onClick={(e) => vote('up')}
					></i>
				</div>

				<div className="track-more-button">
					<i
						className="icon-thumbs-down"
						data-set={cast === 'down'}
						onClick={(e) => vote('down')}
					></i>
				</div>

				<Link to={`/utwor/${id}`} className="track-more-button">
					<i className="icon-info"></i>
				</Link>

				<div className="track-more-button">
					<i
						className="icon-cancel-circled"
						onClick={() => {
							setOpen(false)
						}}
					></i>
				</div>
			</div>
		</div>
	)
}

export default Track
