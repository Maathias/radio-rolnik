import { Link } from 'react-router-dom'
import './Status.css'

function Status(props) {
	return (
		<Link className="status" to={`/utwor/${props.track.id}`}>
			<img
				className="status-image"
				alt="album cover"
				src={props.track.album.art}
			/>
			<span className="status-track">{props.track.title}</span>
			<span className="status-artist">{props.track.artists.join(', ')}</span>
			<i className="icon-info"></i>
			<div
				className="status-progress"
				style={{ width: `calc(var(--max) * ${props.progress})` }}
			></div>
		</Link>
	)
}

export default Status
