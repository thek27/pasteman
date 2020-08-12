
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { clipboard } = require('electron')

const rawdata = fs.readFileSync(path.join(__dirname, '../commands.json'))
const commands = JSON.parse(rawdata)

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
	exec(target.exec + ' ' + path.join(__dirname, '../targets/'+target.app),(error, stdout, stderr) => {})

	prevCmd = cmd
	return false
}
