
# Pasteman

Pasteman is an electron based utility to help you re-use every day scripts. Select your desired command and it will be pasted on a (command) configurable application. You can

- Just paste a command as is by selecting it

- Replace a single value in the selected command with what you had already in the clipboard
- Directly enter the values to be replaced using inline text & select boxes for multiple values

In order for this to work pasteman uses scripting languages that pertain to the underlying system. More specifically, in **darwin** environments we do ask permission for **System Events** so we can use AppleScript to paste the clipboard contents in specific apps (iterm & TablePlus for the time being)

## Installation and usage

If you want to run the app without actually packaging it you can run (in the project root directory)

```npm install```

to install the dependancies and then

```npm start```

In case you want to debug the application you can use

```npm run debug```

which will start the app with the developer tools undocked.

## Application Settings

When you first run the application an app folder is created in your home directory (`.pasteman`) which contains a `commands.json` file which you can edit to add your own custom commands and a `settings.json` file with which you can customise whether your `commands.json` file is `local` or `remote` and the path to it. The `remote` setting can be used to share commands between a team. The executables that are used to facilitate the clipboard access are also copied to the application app in a subfolder called `targets`

### Darwin App Package 

If you want to package the app so you can move it to your applications folder you can run

```npm run package:mac```

This will create an app file in the dist directory you can move to your applications folder

## To do

- Add support for linux and win systems

- Add support for multiple variables in a command
  
- Add subcategories to commands

## Tech

Pasteman uses those technologies

*  [Electron] - Build cross-platform desktop apps with JavaScript, HTML, and CSS

*  [AppleScript] - AppleScript is a scripting language created by Apple.

*  [Ncp] - Asynchronous recursive file & directory copying

*  [NodeFetch] - A light-weight module that brings Fetch API to Node.js.

## License

MIT

**Free Software, Hell Yeah!**


[Electron]: <https://www.electronjs.org/>

[AppleScript]: <https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptLangGuide/introduction/ASLR_intro.html>

[Ncp]: <https://github.com/AvianFlu/ncp>

[NodeFetch]: <https://github.com/node-fetch/node-fetch>