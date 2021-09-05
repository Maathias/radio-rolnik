import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

import './Nav.css'

function Button(props) {
	return (
		<Link
			to={props.to}
			onClick={props.onClick}
			className={`nav-button ${props.active ? 'active' : ''}`}
		>
			<i className={`icon-${props.icon}`}></i>
			<span>{props.label}</span>
		</Link>
	)
}

function Nav(props) {
	function getTab() {
		return props.buttons
			.slice()
			.reverse()
			.find((button) =>
				document.location.pathname.startsWith(button.path ?? button.to)
			).to
	}

	let [current, setCurrent] = useState(getTab()),
		location = useLocation()

	useEffect(() => {
		setCurrent(getTab())
	}, [location]) // eslint-disable-line

	return (
		<nav className="nav">
			{props.buttons.map((button) => (
				<Button
					key={button.label}
					label={button.label}
					icon={button.icon}
					active={button.to === current}
					to={button.to}
					onClick={() => setCurrent(button.to)}
				/>
			))}
		</nav>
	)
}

export default Nav
