const { Plugin } = require('powercord/entities')
const { Tooltip } = require('powercord/components')
const { inject, uninject } = require('powercord/injector')
const { React, getModule, getModuleByDisplayName} = require('powercord/webpack')
const { open: openModal } = require('powercord/modal')
const { findInReactTree } = require('powercord/util')
const NotesHandler = new (require('./NotesHandler'))()

/* TODO:
Fix jump button
*/

const NotebookButton = require('./components/NotebookButton')
const NoteButton = require('./components/NoteButton')
const Modal = require('./components/Modal')

module.exports = class Notebook extends Plugin {
    async startPlugin () {
        this._injectHeaderBarContainer()
        this._injectContextMenu()
        this._injectToolbar()
        this.loadStylesheet('style.css')
        
        powercord.api.commands.registerCommand({
            command: 'notebook',
            description: 'Notebook to keep your favourite notes',
            usage: '{c} [ args ]',
            executor: (args) => {
                //This is truly elegant
                let out = args[1]?this.argHandler(args[1]):{valid:false}
                if(out['valid']===false && args[0]!=='open'){
                    return {
                        send: false,
                        result: 'Please input a valid Link, Index or Message ID'
                    }
                }
                switch(args[0]){               
                    case 'write':
                        NotesHandler.saveNote(out['link'],true)
                        return {
                            send: false,
                            result: 'Note **'+out['messageID']+'** added'
                        }
                        break
                    case 'erase':
                        NotesHandler.deleteNote(out['messageID'])
                        return {
                            send: false,
                            result: 'Note **'+out['messageID']+'** deleted'
                        }
                        break
                    case 'open':
                        let note = NotesHandler.getNote(out['messageID'])
                        if(out['valid']===false || note===undefined) openModal(() => React.createElement(Modal,{all:true}))
                        else openModal(() => React.createElement(Modal,{note, all:false, del:false}))
                        break
                }
            },
            autocomplete: (args) => {
                if (args.length !== 1) {
                    return false;
                }
                let options = {
                    open: 'Opens Notebook or a Note if given it\'s Link, Index or Message ID',
                    write: 'Writes Note given it\'s Message Link',
                    erase: 'Erases Note from your Notebook given it\'s Link, Index or Message ID'
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
            messageID: null,
            valid: false
        }
        let linkArray
        let note
        if(args.includes('/')){
            linkArray = args.split('/')            
            out['link'] = args
            out['messageID'] = linkArray[linkArray.length-1]
            out['valid'] = true
        }else if(args.length>8){
            try{
                out['link'] = NotesHandler.getNote(args)['Message_URL']
                out[messageID] = args
                out['valid'] = true
            }catch(err){}
        }else if(!isNaN(Number(args))){
            note = NotesHandler.getNotes()
            try{
                note = note[Object.keys(note)[Number(args)-1]]
                out['link'] = note['Message_URL']
                out['messageID'] = note['Message_ID']
                out['valid'] = true
            }catch(err){}
        }
        if((out['link'] && out['messageID'])===undefined){
            out['valid'] = false
        }
        return out
    }
}
