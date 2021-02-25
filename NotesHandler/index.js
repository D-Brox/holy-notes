/* Credits to Kyza for making the base of this Handler */
const fs = require('fs')
const path = require('path')
const notesPath = path.join(__dirname, 'notes.json')
//const notebooksPath = path.join(__dirname, 'notebooks.json')
const { getModule } = require('powercord/webpack')
const { getMessage } = getModule(['getMessages'], false)

class NotesHandler {
	constructor() {
		this.initNotes()
	}

	initNotes = () => {
		if (!fs.existsSync(notesPath)) {
			fs.writeFileSync(notesPath, JSON.stringify({}, null, '\t'))
		}
	}

	getNotes = () => {
		this.initNotes()
		return JSON.parse(fs.readFileSync(notesPath))
	}

	getNote = (noteName) => {
		let note
		try {
			note = this.getNotes()[noteName]
		} catch {
			return null
		}
	}

	setNote = (noteData) => {
		this.initNotes()
		let notes
		try {
			notes = this.getNotes()
		} catch {
			return
		}
		let messageId = Object.keys(noteData)[0]
		/* Create a new object array with the key set as the MessageID */
		notes[noteData[messageId]] = {}
		/* Define 'newNoteData' as this new object array */
		let newNoteData = notes[noteData[messageId]]
		//fs.writeFileSync(notesPath, JSON.stringify(notes, null, '\t'))
		for (let i = 0; i < Object.keys(noteData).length; i++) {
			let noteDataName = Object.keys(noteData)[i]
			let noteDataValue = noteData[noteDataName]
			newNoteData[noteDataName] = noteDataValue
		}
		fs.writeFileSync(notesPath, JSON.stringify(notes, null, '\t'))
	}
    deleteNote = (noteName) => {
        this.initNotes()
        let notes
		try {
			notes = this.getNotes()
		} catch {
			return
		}
        if(this.getNote(noteName)){
            delete notes[noteName]
        }
        fs.writeFileSync(notesPath, JSON.stringify(notes, null, '\t'))
    }
    saveNote = (args, link, notebook) => {
        let message
        let messageLink
        let linkArray
        try{
            if(link===true){
                linkArray = args.split("/")
                message = getMessage(linkArray[linkArray.length-2],linkArray[linkArray.length-1])
                messageLink = args
            }
            else {
                message = args.message
                messageLink = `https://discord.com/channels/${args.channel.guild_id?args.channel.guild_id:'@me'}/${args.channel.id}/${args.message.id}`
            }
            let attached = message.attachments
            let embeded = message.embeds
			let mentioned = message.mentions
            embeded =  embeded.filter(embed => !embed['__mlembed']);
            for(let i = 0; i < embeded.length; i++){
                if(embeded[i].timestamp)embeded[i].timestamp=null
            }
            let noteFormat = {
                'Message_ID' : message.id,
                'Username' : message.author.username,
                'User_ID' : message.author.id,
                'Content' : message.content,
                'Timestamp' : message.timestamp,
                'Editstamp' : message.editedTimestamp,
                'Message_URL' : messageLink,
                'Avatar' : message.author.avatar,
                'Discriminator': message.author.discriminator,
                'Notebook': notebook
            }
            if (attached) noteFormat['Attachment'] = attached
            if (embeded) noteFormat['Embeds'] = embeded
			if (mentioned) noteFormat['Mentions'] = mentioned
            this.setNote(noteFormat)} catch(err){console.log(err)}
    }
    noteFixer(note){
        let out
        let avatar
        let embeded
        if(note['Notebook']===undefined){
            out = note
            
            embeded = out["Embeds"]
            embeded = embeded.filter(embed => !embed['__mlembed']);
            for(let i = 0; i < embeded.length; i++){
                if(embeded[i].timestamp)embeded[i].timestamp=null
            }
            out["Embeds"] = embeded
            
            avatar = note["Avatar_URL"].replace(".png","").split("/")
            avatar = avatar[avatar.length-1]
            delete note["Avatar_URL"]
            out["Avatar"] = avatar

            out["Discriminator"] = "0000" //hack lol

            out["Notebook"] = '0'

            out["Message_URL"] = out["Message_URL"].replace("null","@me")

            this.setNote(out)
            return out
        }
		return note
    }
}

/* Preparations for 1.3
class NotebooksHandler {
	constructor() {
		this.initNotebooks()
	}

	initNotebookss = () => {
		if (!fs.existsSync(notebooksPath)) {
			fs.writeFileSync(notebooksPath, JSON.stringify({}, null, '\t'))
		}
	}

	getNotebookss = () => {
		this.initNotes()
		return JSON.parse(fs.readFileSync(notebooksPath))
	}

	getNotebook = (notebookIndex) => {
		let notebook
		try {
			notebook = this.getNotes()[notebookIndex]
		} catch {
			return null
		}
		return notebook
	}

	setNotebook = (notebookData) => {
		this.initNotes()
		let notebooks
		try {
			notebooks = this.getNotebooks()
		} catch {
			return
		}
        
        //deal with stuff here
		//notes[noteData[messageId]] = {}
		//let newNoteData = notes[noteData[messageId]]

		for (let i = 0; i < Object.keys(noteData).length; i++) {
			let noteDataName = Object.keys(noteData)[i]
			let noteDataValue = noteData[noteDataName]
			newNoteData[noteDataName] = noteDataValue
		}
		fs.writeFileSync(notebooksPath, JSON.stringify(notes, null, '\t'))
	}
    deleteNotebook = (notebookIndex) => {
        this.initNotebooks()
        let notebooks
		try {
			notebooks = this.getNotebooks()
		} catch {
			return
		}
        //do stuff here
        fs.writeFileSync(notebooksPath, JSON.stringify(notes, null, '\t'))
    }
    switchNotebookPlaces = (first,second) => {
        //switch notebook places here
        //deal with notes  here
        return
    }
}
*/

module.exports = NotesHandler;
