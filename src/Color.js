import FastAverageColor from 'fast-average-color'

var fac = new FastAverageColor(),
	def = document.documentElement.style.getPropertyValue('--deg')

function setColor(target, lvl) {
	fac
		.getColorAsync(target)
		.then(({ value: [r, g, b] }) => {
			let color =
				Math.atan2(1.732050808 * (g - b), 2 * r - g - b) * 57.295779513

			return color
		})
		.catch((err) => {
			return def
		})
		.then((color) => {
			document.documentElement.style.setProperty('--deg', color + 'deg')
		})
}

export { setColor }
