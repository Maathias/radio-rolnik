import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Track.css'

function Track(props) {
	let [open, setOpen] = useState(false)

	return (
		<div className={['track', open ? 'open' : ''].join(' ')}>
			<div
				className={
					'track-section-a ' + (props.timestamp || props.rank ? '' : 'empty')
				}
			>
				{props.timestamp && (
					<span className="track-timestamp">{props.timestamp}</span>
				)}
				{props.rank && <span className="track-rank">{props.rank}</span>}
				<img
					className="track-image"
					src={props.album.art ?? '/media/default.png'}
					alt="album cover"
				/>
			</div>

			<div className="track-section-b">
				<Link to={`/utwor/${props.id}`} className="track-title">
					{props.title}
				</Link>
				<span className="track-artist">{props.artists.join(', ')}</span>
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
					<i className="icon-thumbs-up"></i>
				</div>
				<div className="track-more-button">
					<i className="icon-thumbs-down"></i>
				</div>
				<Link to={`/utwor/${props.id}`} className="track-more-button">
					<i className="icon-info"></i>
				</Link>
				<div
					className="track-more-button"
					onClick={() => {
						setOpen(false)
					}}
				>
					<i className="icon-cancel-circled"></i>
				</div>
			</div>
		</div>
	)
}

export default Track
