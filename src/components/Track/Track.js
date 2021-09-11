import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Track.css'

function Track({ track, timestamp, rank }) {
	const [open, setOpen] = useState(false),
		{ id, title = '-', artists = ['-'], album = {}, votes = {} } = track ?? {}

	function vote(value) {
		track.setVote(value).then((ok) => ok && setOpen(false))
	}

	return (
		<div className={['track', open ? 'open' : ''].join(' ')} id={id}>
			<div className={'track-section-a ' + (timestamp || rank ? '' : 'empty')}>
				{timestamp && <span className="track-timestamp">{timestamp}</span>}
				{rank && <span className="track-rank">{rank}</span>}
				<img
					className="track-image"
					src={album.art ?? '/media/default.png'}
					alt="album cover"
				/>
			</div>

			<div className="track-section-b">
				<Link to={`/utwor/${id}`} className="track-title">
					{title}
				</Link>
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
						data-set={votes.set === 'up'}
						onClick={(e) => vote('up')}
					></i>
				</div>

				<div className="track-more-button">
					<i
						className="icon-thumbs-down"
						data-set={votes.set === 'down'}
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
