
const path = require('path')
const { ipcRenderer, clipboard } = require('electron')

let commands = ipcRenderer.sendSync('get-commands')

let html=''
Array.prototype.forEach.call(commands.list, (item) => {

	if (item.enabled===undefined || item.enabled===true) {
		html+='<h5 class="nav-category">\
			<svg class="nav-icon"><use xlink:href="assets/icons.svg#icon-'+item.icon+'"></use></svg>\
			'+item.title+'</h5>'
		
		Array.prototype.forEach.call(item.commands, (cmd) => {
			if (cmd.enabled===undefined || cmd.enabled===true) {
				html+='<button ondblclick="" onclick="return copyCommand(\''+cmd.command+'\',\''+item.target+'\')" type="button" \
					class="cmd-button nav-button">'+cmd.title+'</button>'
			}
		})
	}
})

document.getElementById('commands').insertAdjacentHTML('beforeend', html)

let prevCmd = ''
copyCommand = (cmd,target) => {
	if (prevCmd==cmd) return false	
	let val = clipboard.readText()	
	val = cmd.replace('{pasteman}', val)
	clipboard.writeText( val+"\n" )

	target = commands.targets[target]
	const system_call = target.exec + ' ' + path.join(__dirname, '../targets/'+target.app)
	ipcRenderer.sendSync('system-call', system_call)

	prevCmd = cmd
	return false
}
