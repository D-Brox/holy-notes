const { getModule, getModuleByDisplayName, React } = require('powercord/webpack');
const AsyncComponent = require('powercord/components/AsyncComponent');
const { Text } = require('powercord/components');

const DFormItem = AsyncComponent.from(getModuleByDisplayName('FormItem'));
const FormText = AsyncComponent.from(getModuleByDisplayName('FormText'));

let classes = {
  initialized: false,
  flexClassName: '',
  classMargins: {},
  classTitle: '',
  classDivider: '',
  classDividerDef: '',
  classDescription: ''
};

module.exports = class Category extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = { classes };
  }

  async componentDidMount () {
    if (classes.initialized) {
      return;
    }

    const Flex = await getModuleByDisplayName('Flex');
    classes = {
      initialized: true,

      flexClassName: `${Flex.Direction.VERTICAL} ${Flex.Justify.START} ${Flex.Align.STRETCH} ${Flex.Wrap.NO_WRAP}`,
      classMargins: await getModule([ 'marginTop20' ]),
      classTitle: (await getModule([ 'titleDefault' ])).title,
      classDivider: (await getModule(m => Object.keys(m).join('') === 'divider')).divider,
      classDividerDef: (await getModule([ 'dividerDefault' ])).dividerDefault,
      classDescription: (await getModule([ 'formText', 'description' ])).description
    };

    this.setState({ classes });
  }

  render () {
    return (
      <DFormItem className={`powercord-settings-item powercord-category ${classes.flexClassName} ${classes.classMargins.marginBottom20}`}>
        <div className='powercord-settings-item-title' onClick={() => this.props.onChange(!this.props.opened)}>
          <Text>This feature will be implemented in 1.3.0</Text>
          <div>
            <div className={classes.classTitle}>
              {this.props.name}
            </div>
            <FormText className={classes.classDescription}>
              {this.props.description}
            </FormText>
          </div>
        </div>
        {this.props.opened
          ? <div className='powercord-settings-item-inner'>
            {this.props.children}
          </div>
          : <div className={`${classes.classDivider} ${classes.classDividerDef}`} />}

      </DFormItem>
    );
  }
};
