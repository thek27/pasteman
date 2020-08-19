
const path = require('path')
const { ipcRenderer, clipboard } = require('electron')
const { loadavg } = require('os')

let commands = ipcRenderer.sendSync('get-commands')

formatCommand = (id,cmd) => {
	let command = cmd.command.replace('{pasteman}', '<img style="position:relative;top:4px;" src="assets/app-icon/png/16.png"/>')
	if (!cmd.vars) {
		return command
	}
	Object.entries(cmd.vars).forEach( (v) => {
		let html = ''
		switch(v[1].type) {
			case 'select':
				html='<select class="'+id+'" id="'+v[0]+'">';
				Array.prototype.forEach.call(v[1].options, (option) => {
					html+='<option value="'+option+'">'+option+'</option>'
				})
				html+='</select>'
				break
			case 'text':
				html='<input onfocus="this.className=\''+id+'\'" class="'+id+'" id="'+v[0]+'" type="text"></input>'
				break
		}
		command = command.replace('{'+v[0]+'}', html)
	})
	return command
}

let html=''
let firstItem = true
Array.prototype.forEach.call(commands.list, (item) => {

	if (item.enabled===undefined || item.enabled===true) {
		html+='<h5 class="nav-category '+(firstItem?'first':'')+'">\
			<svg class="nav-icon"><use xlink:href="assets/icons.svg#icon-'+item.icon+'"></use></svg>\
			'+item.title+'</h5>'
		
		Array.prototype.forEach.call(item.commands, (cmd) => {
			if (cmd.enabled===undefined || cmd.enabled===true) {
				const id = 'cmd_'+Math.random().toString(36).substring(2)
				html+='<button ondblclick="" onclick="return copyCommand(\''+id+'\',\''+cmd.command+'\',\''+item.target+'\')" type="button" \
					class="cmd-button nav-button">'+cmd.title+'</button>\
					<div class="code"><code>' + formatCommand(id,cmd) + '</code></div>'
			}
		})
	}

	firstItem = false
})

document.getElementById('commands').insertAdjacentHTML('beforeend', html)

copyCommand = (id,command,target) => {

	const clipVal = clipboard.readText()
	let cmdVal = command.replace('{pasteman}', clipVal)

	let err = false
	const vars = document.getElementsByClassName(id)
	Array.prototype.forEach.call(vars, (v) => {
		if (v.value.length==0) {
			v.className = id+' error'
			err = true
			return false
		}
		cmdVal = cmdVal.replace('{'+v.id+'}', v.value)
	})
	if (err) {
		return false
	}
	
	clipboard.writeText( cmdVal+"\n" )
	
	if (!target) {
		return false
	}

	target = commands.targets[target]
	if (!target) {
		return false
	}

	const system_call = target.exec + ' ' + path.join(__dirname, '../targets/'+target.app)
	ipcRenderer.sendSync('system-call', system_call)

	setTimeout(function() {
		clipboard.writeText( clipVal )
	},1000)
	
	return false
}

setInterval( () => {
	let val = clipboard.readText().trim().split("\n")
	val = val.length>1 ? val[0] + '...' : val[0]
	if (val.length>60) {
		val = val.substr(0,58) + '...'
	}
	document.getElementById('clipboard').innerText = val
	document.getElementById('clipboard').style.display = ''
},1000)