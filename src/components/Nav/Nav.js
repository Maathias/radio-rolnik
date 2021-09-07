import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

import './Nav.css'

function Button({ to, onClick, active, icon, label }) {
	return (
		<Link
			to={to}
			onClick={onClick}
			className={`nav-button ${active ? 'active' : ''}`}
		>
			<i className={`icon-${icon}`}></i>
			<span>{label}</span>
		</Link>
	)
}

function Nav({ buttons }) {
	function getTab() {
		return buttons
			.slice()
			.reverse()
			.find((button) =>
				document.location.pathname.startsWith(button.path ?? button.to)
			).label
	}

	const [current, setCurrent] = useState(getTab()),
		location = useLocation()

	useEffect(() => {
		setCurrent(getTab())
		const label = (function () {
			switch (current) {
				default:
				case 'History':
				case 'Top':
				case 'Ustawienia':
					return current
				case 'Wyszukaj':
				case 'Utwór':
					return false
			}
		})()

		// don't update for custom titles
		label && (document.title = `${label} | radio-rolnik`)
	}, [location]) // eslint-disable-line

	return (
		<nav className="nav">
			{buttons.map(({ label, icon, to }) => (
				<Button
					key={label}
					label={label}
					icon={icon}
					active={label === current}
					to={to}
					onClick={() => setCurrent(label)}
				/>
			))}
		</nav>
	)
}

export default Nav
