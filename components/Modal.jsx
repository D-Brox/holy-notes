const { getModule, getModuleByDisplayName, React } = require('powercord/webpack');
const { Modal } = require('powercord/components/modal');
const { FormTitle, Text } = require('powercord/components');
const { close: closeModal } = require('powercord/modal');
const { getCurrentUser, getUser } = getModule([ 'getCurrentUser' ], false);

const NotesHandler = new (require('../NotesHandler'))();
const Message = getModule(m => m.prototype && m.prototype.getReaction && m.prototype.isSystemDM, false);
const UserStore = getModule([ 'getCurrentUser' ], false);
const ChannelMessage = getModule(m => m.type && m.type.displayName == 'ChannelMessage', false)

const channel = {
	isPrivate: () => false,
	isSystemDM: () => false,
	getGuildId: () => 'NoteModal'
};

class noteDisplay extends React.PureComponent {
    constructor(props) {
        super(props)
    }

    async componentDidMount() {
    }

    render() {
        const noteArray = [];
        const settings = NotesHandler.getNotes();

        for(let i = 0; i < Object.keys(settings).length; i++) {
            let note = settings[Object.keys(settings)[i]]

			const user = UserStore.getUser(note['User_ID']);
			let ExampleMessage = <ChannelMessage
			message={new Message({ author: user, content: note['Content'], attachments: note['Attachment'] || [], embeds: note['Embeds'] || [], id: note['Message_ID']})}
			channel={channel}/>
			noteArray.push(ExampleMessage)
			noteArray.push(<br/>)
        }

    return(	
        <Modal className='Notebook' size={Modal.Sizes.LARGE}>
            <Modal.Header>
            <FormTitle tag='h3'>Notebook</FormTitle>
            <Modal.CloseButton onClick={closeModal}/>
            </Modal.Header>

            <Modal.Content>
						{noteArray}

            </Modal.Content>
        </Modal>
        )
    }
}

module.exports = noteDisplay;

