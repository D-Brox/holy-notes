const { getModule, getModuleByDisplayName, React} = require('powercord/webpack');
const { Modal } = require('powercord/components/modal');
const { FormTitle, Text, Divider, Tooltip, Icon, Button } = require('powercord/components');
const { close: closeModal, closeAll: closeModals, open: openModal } = require('powercord/modal');
const { getCurrentUser, getUser } = getModule([ 'getCurrentUser' ], false);
const { transitionTo } = getModule([ 'transitionTo' ], false);

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
                NoteMessage = <div className='hn-note'>
                    <ChannelMessage
                        message={
                            new Message({
                                author: user,
                                content: note['Content'],
                                attachments: note['Attachment'] || [],
                                embeds: note['Embeds'] || [],
                                mentions: note['Mentions'] || [],
                                id: note['Message_ID']
                        })}
                        channel={channel}
                    />
                    <div className='hn-tools'>
                        <div className='hn-tool-jump'>
                            <Tooltip position='top' text="Jump to Message">
                                <Icon name='Search'
                                    className='hn-jump-icon'
                                    onClick={()=>{
                                        transitionTo(note["Message_URL"].split("https://discord.com").join(""))
                                        closeModal()
                                }}/>
                            </Tooltip>
                        </div><div className='hn-tool-delete'>
                            <Tooltip position='top' text="Delete Note">
                                <Icon name='Trash'
                                    className='hn-delete-icon'
                                    onClick={() => {
                                    openModal(() => React.createElement(noteDisplay,{note,all:false,del:true}))
                                    this.forceUpdate()
                                }}/>
                            </Tooltip>
                        </div><div className='hn-tool-expand'>
                            <Tooltip position='top' text="Isolated Message">
                                <Icon name='Fullscreen'
                                    className='hn-expand-icon'
                                    onClick={() => {
                                        openModal(() => React.createElement(noteDisplay,{note,all:false,del:false}))
                                    }}
                                    />
                            </Tooltip>
                        </div>
                    </div>
                </div>
                noteArray.push(NoteMessage)
                noteArray.push(<br/>)
                divider = (i===(Object.keys(notes).length-1))?<></>:<Divider/>
                noteArray.push(divider)
            }
            noteArray.push(<br/>)
            title = 'Notebook'
            size = Modal.Sizes.LARGE
        } else {
            const note = this.props.note
            const user = UserStore.getUser(note['User_ID']);
            UIelements = <></>
            
            title = 'Note '+note['Message_ID']
            size = Modal.Sizes.LARGE
            if(this.props.del){
                title = 'Delete Message '+note['Message_ID']+'?'
                buttons= []
                buttons.push(
                    <Button
                        className='hn-note-delete'
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
                        className='chn-note-cancel'
                        style={{ marginRight: "10px" }} 
                        color={Button.Colors.GRAY}
                        onClick={closeModal}
                    >Cancel
                    </Button>)
            }else {
                buttons=<></>
                
                UIelements = <div className='hn-tools2'>
                    <div className='hn-tool-jump'>
                            <Tooltip position='top' text="Jump to Message">
                                <Icon name='Search'
                                    className='hn-jump-icon'
                                    onClick={()=>{
                                        transitionTo(note["Message_URL"].split("https://discord.com").join(""))
                                        closeModals()
                                }}
                                />
                            </Tooltip>
                    </div><div className='hn-tool-delete'>
                        <Tooltip position='top' text="Delete Note">
                            <Icon name='Trash'
                                className='hn-delete-icon'
                                onClick={() => {
                                    openModal(() => React.createElement(noteDisplay,{note,all:false,del:true}))
                                    this.forceUpdate()
                                }}
                            />
                        </Tooltip>
                    </div>
                    <br/>
                </div>
            }
            NoteMessage = <div className='hn-note'>
                <ChannelMessage
                    message={
                        new Message({
                            author: user,
                            content: note['Content'],
                            attachments: note['Attachment'] || [],
                            embeds: note['Embeds'] || [],
                            mentions: note['Mentions'] || [],
                            id: note['Message_ID']
                    })}
                    channel={channel}
                />
                {UIelements}
                <br/>
            </div>
            noteArray.push(NoteMessage)
        }
        try{return(    
        <Modal className='hn-notebook' size={size}>
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

