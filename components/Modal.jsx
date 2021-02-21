const { getModule, getModuleByDisplayName, React } = require('powercord/webpack');
const { Modal } = require('powercord/components/modal');
const { FormTitle, Text, Divider, Tooltip, Icon, Button } = require('powercord/components');
const { close: closeModal, open: openModal } = require('powercord/modal');
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
        let NoteMessage
        let title
        let size
        let buttons = <></>
        let UIelements
        if(this.props.all){
            const notes = NotesHandler.getNotes();
            for(let i = 0; i < Object.keys(notes).length; i++) {
                let note = notes[Object.keys(notes)[i]]
                let divider
                const user = UserStore.getUser(note['User_ID']);
                NoteMessage = <div className='NoteMessages'>
                    <ChannelMessage
                        message={
                            new Message({
                                author: user,
                                content: note['Content'],
                                attachments: note['Attachment'] || [],
                                embeds: note['Embeds'] || [],
                                id: note['Message_ID']
                        })}
                        channel={channel}
                    /><Tooltip position='top'>
                        <Icon name='Reply' color='var(--interactive-normal)' onClick={closeModal}/>
                        <Icon name='Search' color='var(--interactive-normal)' onClick={() => {
                            openModal(() => React.createElement(noteDisplay,{note,all:false,del:false}))
                        }}/>
                        <Icon name='Trash' color='var(--interactive-normal)' onClick={() => {
                            openModal(() => React.createElement(noteDisplay,{note,all:false,del:true}))
                            this.forceUpdate()
                        }}/>
                    </Tooltip>
                </div>
                noteArray.push(NoteMessage)
                
                divider = (i===(Object.keys(notes).length-1))?<></>:<Divider/>
                noteArray.push(divider)
                noteArray.push(<br/>)
            }
            title = 'Notebook'
            size = Modal.Sizes.LARGE
        } else {
            const note = this.props.note
            const user = UserStore.getUser(note['User_ID']);
            UIelements = <></>
            
            title = 'Message '+note['Message_ID']
            size = Modal.Sizes.MEDIUM
            if(this.props.del){
                title = 'Delete Message '+note['Message_ID']+'?'
                buttons= []
                buttons.push(
                    <Button
                        className='delete button'
                        color={Button.Colors.RED}
                        onClick={ () => {
                            closeModal()
                            NotesHandler.deleteNote(note['Message_ID'])
                        }}
                    >Delete
                    </Button>
                )
                buttons.push(
                    <Button
                        className='cancel button'
                        style={{ marginRight: "10px" }} 
                        color={Button.Colors.GRAY}
                        onClick={closeModal}
                    >Cancel
                    </Button>)
            }else {
                buttons=<Button
                    className='delete button'
                    color={Button.Colors.GRAY}
                    onClick={closeModal}
                >Jump To Message
                </Button>
                UIelements = <Tooltip position='top'>
                    <Icon name='Reply' color='var(--interactive-normal)' onClick={closeModal}/>
                    <Icon name='Trash' color='var(--interactive-normal)' onClick={() => {
                        openModal(() => React.createElement(noteDisplay,{note,all:false,del:true}))
                        this.forceUpdate()
                    }}/>
                </Tooltip>
            }

            NoteMessage = <div className='NoteMessages'>
                <ChannelMessage
                    message={
                        new Message({
                            author: user,
                            content: note['Content'],
                            attachments: note['Attachment'] || [],
                            embeds: note['Embeds'] || [],
                            id: note['Message_ID']
                    })}
                    channel={channel}
                />
                {UIelements}
            </div>
            noteArray.push(NoteMessage)
        }
        try{return(    
        <Modal className='Notebook' size={size}>
            <Modal.Header>
                <FormTitle tag='h3'>{title}</FormTitle>
                <Modal.CloseButton onClick={closeModal}/>
            </Modal.Header>

            <Modal.Content>
                    {noteArray}
            </Modal.Content>
            <Modal.Footer>
                {buttons}
            </Modal.Footer>
        </Modal>
        )}catch(err){console.log(err)}
    }
}

module.exports = noteDisplay;
