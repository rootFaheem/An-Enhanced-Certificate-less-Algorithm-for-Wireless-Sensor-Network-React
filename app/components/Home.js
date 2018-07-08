// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';
//CLIENT VERSION FOR SOCKET
import openSocket from 'socket.io-client';
type Props = {};
//DEPENDECIES
import { Icon, Input,Header,Grid,Image,Message,Form,Segment,List,Label,Popup } from 'semantic-ui-react';
import bigInt from 'big-integer'
//CONNECT TO SOCKET ON SERVER PORT
const socket=openSocket('http://localhost:8003');

export default class Home extends Component<Props> {
  props: Props;
  constructor(){
    super();
    this.state={
      userConfig:null,
      clusterInfo:[],
      message:'',
      error:false,
      message2:'',
      publicKey:null,
      C1:'NOT_SET',
      C2:'NOT_SET',
      DEC_C1:null,
      error_DEC_C1:false,
      error_DEC_C2:false,
      DEC_C2:null,
      Decrypted_MESSAGE:'NOT_SET',
      randomState:null
    }
  }
componentWillUnMount(){
  socket.emit('let_me_go',()=>{

  });
}
handleChange=(e,{name,value})=>{
  this.setState({[name]:value})
}
_calculateMeta=()=>{
  if(this.state.message.length<1){
    this.setState({
      error:true
    })
  }else{
    var M=parseInt(this.state.message,2);
    var K=Math.floor(Math.random()*100+1);
    //PVT[0] IS X COORDINATE ON ELLIPTIC CURVE
    var Q=bigInt(this.state.userConfig.KPAK).multiply(bigInt(this.state.userConfig.PVT[0]))
    this.setState({
      C1:bigInt(this.state.userConfig.PVT[0]).multiply(K),
      C2:M+(K*bigInt(Q))
    })
  }
}
toFixed(x) {
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split('e-')[1]);
    if (e) {
        x *= Math.pow(10,e-1);
        x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
        e -= 20;
        x /= Math.pow(10,e);
        x += (new Array(e+1)).join('0');
    }
  }
  return x;
}
_calculateDeMeta=()=>{
  if(this.state.DEC_C1==null||this.state.DEC_C1.length<1){
    this.setState({
      error_DEC_C1:true
    })
    return;
  }
  if(this.state.DEC_C2==null||this.state.DEC_C2.length<1){
    this.setState({
      error_DEC_C2:true
    })
    return;
  }
 this.setState({
    Decrypted_MESSAGE:bigInt(this.state.DEC_C2).minus(bigInt(this.state.userConfig.KPAK).multiply(bigInt(this.state.DEC_C1)))
  },()=>{
    console.log(this.state.Decrypted_MESSAGE.toString(2))
  })
}
componentDidMount(){
  socket.emit('initiate_node',()=>{
  });
  socket.on('setup_credentials',(data)=>{
    Object.keys(data).map((key)=>{
      if(key!=socket.id){
        this.state.clusterInfo.push(data[key]._id);
      }else{
        this.setState({
          userConfig:data[socket.id]
        },()=>{
          console.log(this.state.userConfig);
        })
      }
    });
  });
}
  render() {
    return (
      <div>
        <div className={styles.container} data-tid="container">
        <Grid verticalAlign='middle' columns={3} centered>
    <Grid.Row>
      <Grid.Column>
      <Header as='h2' icon textAlign='center'>
          <Icon name='hashtag' circular />
            <Header.Content>
            {
              (this.state.userConfig&&this.state.userConfig._id)?(
                this.state.userConfig._id
              ):(
              <h3>Loading</h3>
              )
            }
            </Header.Content>
          </Header>
      </Grid.Column>
    </Grid.Row>
    <Grid.Row columns={2}>
      <Grid.Column width={8}>
      <Message
      attached
      header='WSN Encryption'
      color="grey"

      content='Write a binary Number to Encrypt'
    />
        <Form className='attached fluid segment'>
        <Form.Input
          name="message"
          error={this.state.error}
          onChange={this.handleChange}
          icon={<Icon name='hashtag' onClick={this._calculateMeta} inverted circular link />}
          placeholder='110011'
        />
        </Form>
        <Segment attached>
        <List>
          <List.Item icon='hashtag' content={'C1 :'+this.state.C1} />
          <List.Item icon='hashtag' content={'C2 :'+this.state.C2} />
        </List>
        </Segment>
      </Grid.Column>
      <Grid.Column width={8}>
      <Message
      attached
      header='WSN Decryption'
      content='Write a Encrypted Message'
    />
        <Form className='attached fluid segment'>
        <Form.Input
        name="DEC_C1"
        error={this.state.error_DEC_C1}
        icon={<Popup
        trigger={<Icon circular name='help' circular inverted link />}
        content='Enter Message Component C1'
        inverted
        on='hover'
    />}
        placeholder='Message Component C1'
        onChange={this.handleChange}
        />
        <Form.Input
        name="DEC_C2"
        error={this.state.error_DEC_C2}
        icon={<Popup
        trigger={<Icon circular name='help' circular inverted link />}
        content='Enter Message Component C2'
        inverted
        on='hover'
        position="bottom"
    />}
        placeholder='Message Component C2'
        onChange={this.handleChange}
        />
        <Form.Button
          primary
          onClick={this._calculateDeMeta}
          fluid>

          Decrypt
          </Form.Button>
        </Form>
        <Segment attached>
          {
            'Decrypted Message :'+this.state.Decrypted_MESSAGE.toString(2)
          }
        </Segment>
      </Grid.Column>
      </Grid.Row>
      <Grid.Row verticalAlign="bottom" className={styles.footer}>
      <Message
    icon='wifi'
    header='WSN Implementation Message'
  />
    </Grid.Row>
  </Grid>
        </div>
      </div>
    );
  }
}
