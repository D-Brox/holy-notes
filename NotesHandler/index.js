/* Credits to Kyza for making the base of this Handler */
const fs = require('fs')
const path = require('path')
const notesPath = path.join(__dirname, 'notes.json')
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
		return note
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
    saveNote = (args, link) => {
        let message
        let messageLink
        let linkArray
        //console.log(args)
        try{
            if(link===true){
                linkArray = args.split("/")         
                message = getMessage(linkArray[linkArray.length-2],linkArray[linkArray.length-1])
                messageLink = args
            }
            else {
							message = args.message
							if (args.channel.type === 1 || args.channel.type === 3) {
								messageLink = `https://discord.com/channels/@me/${args.channel.id}/${args.message.id}`
							} else {
								messageLink = `https://discord.com/channels/${args.channel.guild_id}/${args.channel.id}/${args.message.id}`
							}
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
                'Avatar_URL' : `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
            }
            if (attached) noteFormat['Attachment'] = attached
            if (embeded) noteFormat['Embeds'] = embeded
			if (mentioned) noteFormat['Mentions'] = mentioned
            this.setNote(noteFormat)} catch(err){console.log(err)}
    }
}

module.exports = NotesHandler
