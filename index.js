const { Plugin } = require('powercord/entities')
const { Tooltip } = require('powercord/components')
const { inject, uninject } = require('powercord/injector')
const { React, getModule, getModuleByDisplayName} = require('powercord/webpack')
const { open: openModal } = require('powercord/modal')
const { findInReactTree } = require('powercord/util')
const NotesHandler = new (require('./NotesHandler'))()

/* TODO:
Clean notebook command. It's cleaner, but can be better
Add buttons to Modal
*/

const NotebookButton = require('./components/NotebookButton')
const NoteButton = require('./components/NoteButton')
const Modal = require('./components/Modal')

module.exports = class Notebook extends Plugin {
    async startPlugin () {
        this._injectHeaderBarContainer()
        this._injectContextMenu()
        this._injectToolbar()
        
        powercord.api.commands.registerCommand({
            command: 'notebook',
            description: 'Notebook to keep your favourite notes',
            usage: '{c} [ args ]',
            executor: (args) => {
                let IDArray
                if(args[1]) IDArray = args[1].split("/")
                let n = Number(args[1])
                let result
                let notes
                let note
                switch(args[0]){               
                    case 'write':
                        if(!args[1]) return {
                            send: false,
                            result: 'Please input a valid link'
                        }
                        NotesHandler.saveNote(args[1],true)
                        return {
                            send: false,
                            result: 'Note **'+IDArray[IDArray.length-1].toString()+'** added'
                        }
                        break
                    case 'erase':
                        let messageID
                        notes = NotesHandler.getNotes()
                        if(n.isNaN)return {
                            send: false,
                            result: 'Please input a number or vald ID'
                        }
                        note = notes[Object.keys(notes)[n-1]]
                        messageID = note['Message_ID'] 
                        if(messageID===undefined)return {
                            send: false,
                            result: '**Not a note.**'
                        }
                        NotesHandler.deleteNote(messageID)
                        return {
                            send: false,
                            result: 'Note **'+n.toString()+'** deleted'
                        }
                        break
                    case 'open':
                        if(!n) n = 1
                        notes = NotesHandler.getNotes()
                        if(!Object.keys(notes).length) return {
                            send: false,
                            result: '```\nThere are no notes in your Notebook.\n```'
                        }
                        let end
                        if(Math.floor(Object.keys(notes).length/10) < n || args[1]==='last'){
                            n = Math.floor(Object.keys(notes).length/10)+1
                            end = Object.keys(notes).length
                        }
                        else end = 10*n
                        let out = ''
	                    for(let i =10*(n-1); i<end; i++) {	        
                            let note = Object.keys(notes)[i]
                            //console.log(note)
                            let noteID = i+1
                            let noteUser = notes[note]["Username"]         
                            out+= '**Note '+noteID.toString()+"** by *"+ noteUser+"*:\n```"
                            let contentwords = notes[note]["Content"].split(" ")
                            for(let j = 0; j<contentwords.length && j<10; j++) out+=" "+contentwords[j]
                            if(contentwords.length>10) out+= "..."
                            out+='\n```'
                        }
                        result = {
                            type: 'rich',
                            title: 'Notebook (page '+ n.toString() +')\nNotes '+ (10*(n-1)+1).toString() +" to "+ end.toString() +':',
                            description: out
                        };     
                        return {
                            send: false,
                            result
                        }
                        break
                    case 'read':
                        if(n.isNaN)return {
                            send: false,
                            result: '**Not a note.**'
                        }
                        notes = NotesHandler.getNotes()
                        note = notes[Object.keys(notes)[n-1]]
                        //console.log(note)
                        if(note===undefined)return {
                            send: false,
                            result: 'Not a note.'
                        }
                        openModal(() => React.createElement(Modal,{note, all:false,del:false}))
                        break
                }
            },
            autocomplete: (args) => {
			    if (args.length !== 1) {
				    return false;
			    }
                let options = {
                    read: 'Shows Note as embed given it\'s number',
                    open: 'Opens the Nth Page of Notebook, with 10 notes/page.',
                    write: 'Writes Note given it\'s message link',
                    erase: 'Erases Note from your Notebook given it\'s number.'
                }
			    return {
				    commands: Object.keys(options)
					    .filter((option) => option.includes(args[0].toLowerCase()))
					    .map((option) => ({
						    command: option,
						    description: options[option],
					    })),
				    header: 'Notebook commands',
			    };
		    }
        }) 
    }

    pluginWillUnload () {
        uninject('note-button')
        uninject('note-context-menu')
        uninject('note-toolbar')
        powercord.api.commands.unregisterCommand('notebook')
    }

    async _injectHeaderBarContainer () {
        const classes = await getModule([ 'iconWrapper', 'clickable' ])
        const HeaderBarContainer = await getModuleByDisplayName('HeaderBarContainer')
        inject('note-button', HeaderBarContainer.prototype, 'renderLoggedIn', (args, res) => {
            const Switcher = React.createElement(Tooltip, {
                    text: 'Notebook',
                    position: 'bottom'
                }, React.createElement('div', {
                        className: [ 'note-button', classes.iconWrapper, classes.clickable ].join(' ')
                    },React.createElement(NotebookButton, {
                        className: [ 'note-button', classes.icon ].join(' '),
                        onClick: () => openModal(() => React.createElement(Modal,{all:true}))
                    })
                )
            )
            if (!res.props.toolbar) {
                res.props.toolbar = Switcher
            } else {
                res.props.toolbar.props.children.push(Switcher)
            }
            return res
        })
    }
    async _injectContextMenu() {
        const Menu = await getModule(['MenuGroup', 'MenuItem'])
        const MessageContextMenu = await getModule(m => m.default && m.default.displayName == 'MessageContextMenu')
        inject('note-context-menu', MessageContextMenu, 'default', (args, res) => {
            if (!findInReactTree(res, c => c.props && c.props.id == 'notebook'))
                res.props.children.splice(4, 0,React.createElement(
                    Menu.MenuGroup, null,React.createElement(Menu.MenuItem,{
                        action: () => NotesHandler.saveNote(args[0],false),
                        id: 'notebook',
                        label: 'Note Message'
                    }
                )
            )) 
            return res
        })
        MessageContextMenu.default.displayName = 'MessageContextMenu'
    }

    async _injectToolbar() {
	    const MiniPopover = await getModule((m) => m?.default?.displayName === "MiniPopover");
        inject("note-toolbar", MiniPopover, "default", (args, res) => {
		    const props = findInReactTree(res, (r) => r?.message);
		    const channel = findInReactTree(args, (r) => r?.channel);
		    if (!props) return res;
            //console.log(channel.channel.guild_id)
		    res.props.children.unshift(
			    React.createElement(NoteButton, {
                    message: props.message,
                    channel: channel.channel
			    })
		    );
		    return res;
	    });
	    MiniPopover.default.displayName = "MiniPopover";
    }
    argHandler(args){
        let out = {
            link: null,
            messageID: null
        }
        return out
    }
}
