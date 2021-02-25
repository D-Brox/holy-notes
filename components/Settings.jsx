const { React, getModule } = require('powercord/webpack')
const { Category, SwitchItem, TextInput, SliderInput, KeybindRecorder } = require('powercord/components/settings')
const { Button, Text } = require('powercord/components');
const CategoryTitle = require("./CategoryTitle");
const NotesHandler = new (require("../NotesHandler"))();

let Notebooks = [];
module.exports = class Settings extends React.PureComponent {
    constructor (props) {
        super(props);
        this.state = {}
        this.listOpened = false;
    }

    addNewNotebook(notebookName){
        //NotesHandler.createBook(notebookName);
        return;
    }
    removeNotebook(notebookName){
        //Notebooks.removeBook(notebookName);
        return;
    }
    updateNotebook(oldNotebookName, newNotebookName){
        //Notebooks.updateBook(oldNotebookName, newNotebookName)
        return;
    }
    updateNamePos(pos) {
        //Notebooks.getNamePosition();
        return;
    }

    render() {
        const { getSetting, updateSetting } = this.props;
        Notebooks = getSetting("NotebookS");
        return(
            <div>
                <Category name="Notebooks" description="Add and remove Notebooks" opened={this.state.listOpened} onChange={p=>{this.setState({"listOpened": p})}}>
                        <div>
                            <CategoryTitle>
                                <TextInput
                                defaultValue={"Main"}
                                onChange={p=>{
                                    updateSetting('NotebookS', this.updateNotebook(oldNotebookName, newNotebookName))
                                    
                                }}
                                >
                                    Set Notebook Name
                                </TextInput>
                                <Button color={Button.Colors.RED} onClick={()=>{
                                    updateSetting('NotebookS', this.removeNotebook(notebookName));
                                }}
                                >Remove Notebook</Button>
                                <h1 style={{'color': 'lightgrey', 'margin-bottom': '12px'}}>Advanced Configuration</h1>
                                <SwitchItem
                                    value={"prefix"}
                                    onChange={p=>{
                                        updateSetting('NotebookS', this.updateNamePos(i,false))
                                    }}
                                >Prefix/Sufix</SwitchItem>
                            </CategoryTitleImage>
                        </div>
                    <Button
                    onClick={() => {updateSetting('NotebookS', this.addNewNotebook(notebookName))}}
                    >
                    Click this button to crash discord
                    </Button>   
                </Category>
            </div>
        )
    }
}
