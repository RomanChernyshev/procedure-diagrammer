import React from 'react';
import './Field.css';
import Block from './Block';
import Connection from './Connection';
import ConnectionTypesEnum from './ConnectionTypes'

var model = {
  blocks:[
      {
          Id: 1,
          Title: "Триггер",
          Position:{
              x: 120,
              y: 50
          },
          Connects:[
              2
          ]
      },
      {
          Id: 2,
          Title: "Абырвалг",
          Position:{
              x: 700,
              y: 100
          },
          Connects:[]
      },
      {
        Id: 3,
        Title: "API",
        Position:{
            x: 670,
            y: 350
        },
        Connects:[]
      },
      {
        Id: 4,
        Title: "Функция",
        Position:{
            x: 480,
            y: 820
        },
        Connects:[]
      },
      {
        Id: 5,
        Title: "Оповещение",
        Position:{
            x: 750,
            y: 250
        },
        Connects:[]
      }
  ]
}

const emptyBlockErrorMessage = "Block not found"
const emptyCoordinates = {
  x: 0,
  y: 0
}

const findBlockById = (blocks, id) => {
  return blocks.find((block => {return block.Id == id}))
}

const hasConntection = (block, conntection) => {
  return block.Connects.some((item)=>{
    return item == conntection; 
  })
}

const getConnectionModel = (nominalStartId, nominalEndId, connectionType) => {
  if(!nominalStartId || !nominalEndId){
    return null;
  }
  var result = {}
  if(connectionType == ConnectionTypesEnum.input){
    result.source = nominalEndId;
    result.destination = nominalStartId;
  }
  else if(connectionType == ConnectionTypesEnum.output){
    result.source = nominalStartId;
    result.destination = nominalEndId;
  }
  else{
    return null;
  }
  return result;
}

const getPositionModel = (connectedBlock, mousePosition, connectionType) => {
  if(!connectedBlock || !mousePosition){
    return null;
  }
  var result = {};
  if(connectionType == ConnectionTypesEnum.input){
    result.StartPoint = mousePosition;
    result.EndPoint = getInputConnectorCoords(connectedBlock);
  }
  else if(connectionType == ConnectionTypesEnum.output){
    result.StartPoint = getOutputConnectorCoords(connectedBlock);
    result.EndPoint = mousePosition;
  }
  else {
    return null;
  }
  return result;
}

const getInputConnectorCoords = (block) => {
  if(!block){
    throw Error(emptyBlockErrorMessage);
  }
  var element = document.getElementById(block.Id);
  if(!element){
    return emptyCoordinates;
  }
  return {
    x: block.Position.x,
    y: block.Position.y + element.offsetHeight/2
  };
}

const getOutputConnectorCoords = (block) => {
  if(!block){
    throw Error(emptyBlockErrorMessage);
  }
  var element = document.getElementById(block.Id);
  if(!element){
    return emptyCoordinates;
  }
  return {
    x: block.Position.x + element.offsetWidth,
    y: block.Position.y + element.offsetHeight/2
  };
}

class Field extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      draggedObj: null,
      correction: null,
      renderedBlocksCount:0,
    };
    this.onBlockDrag = this.onBlockDrag.bind(this);
    this.onBlockDrop = this.onBlockDrop.bind(this);
    this.onConnectionDrag = this.onConnectionDrag.bind(this);
    this.onConnectionDrop = this.onConnectionDrop.bind(this);
  }

  componentWillUnmount(){
    this.removeBlockDndListeners();
    this.removeConnectionListeners();
  }

  onStartBlockDrag(block, correction) {
    this.setState({
      draggedObj: block,
      correction: correction
    });
    document.addEventListener('mousemove', this.onBlockDrag);
    document.addEventListener('mouseup', this.onBlockDrop);
  } 

  onBlockDrop(event){
    event.stopPropagation();
    event.preventDefault();
    this.removeBlockDndListeners();
    this.setState({
      draggedObj: null
    });
  }

  onBlockDrag(event){
    event.stopPropagation();
    event.preventDefault();
    if(!this.state.draggedObj){
      return;
    }
    this.updateBlockPosition(event);
    this.forceUpdate();
  }

  onEnterToBlock(blockId){
    if(!this.state.connectableParentBlockId){
      return;
    }
    this.setState({
      targetConnectableBlockId: blockId 
    });
  }

  onLeaveBlock(){
    if(!this.state.connectableParentBlockId){
      return;
    }
    this.setState({
      targetConnectableBlockId: null
    })
  }

  updateBlockPosition(event) {
    var targetBlock = findBlockById(model.blocks, this.state.draggedObj.Id);
    targetBlock.Position.x = event.clientX - this.state.correction.x;
    targetBlock.Position.y = event.clientY - this.state.correction.y;
  }

  removeBlockDndListeners(){
    document.removeEventListener('mousemove', this.onBlockDrag);
    document.removeEventListener('mouseup', this.onBlockDrop);
  }

  onBlockWillMount(){
    this.setState({renderedBlocksCount: ++this.state.renderedBlocksCount})
  }

  onStartConnectionDrag(blockId, connectionType){
    if(!blockId || !connectionType){
      return;
    }

    this.setState({
      connectionType: connectionType,
      connectableParentBlockId: blockId
    })

    document.addEventListener('mouseup', this.onConnectionDrop);
    document.addEventListener('mousemove', this.onConnectionDrag);
  }

  onConnectionDrop(){
    var connectionModel = getConnectionModel(
      this.state.connectableParentBlockId,
      this.state.targetConnectableBlockId,
      this.state.connectionType);

    var sourceBlock = findBlockById(model.blocks, connectionModel?.source)
    if (
      sourceBlock
      && connectionModel.destination
      && connectionModel.source != connectionModel.destination
      && !hasConntection(sourceBlock, connectionModel.destination)
    ) {
      sourceBlock.Connects.push(connectionModel.destination);
    }
    this.setState({
      connectableParentBlockId: null,
      connectionEndPosition: null
    });
    this.removeConnectionListeners();
    this.forceUpdate();
  }

  onConnectionDrag(event){
    if(!this.state.connectableParentBlockId){
      return;
    }

    this.setState({
      connectionEndPosition: {
        x: event.clientX,
        y: event.clientY
      }
    })
  }

  removeConnectionListeners(){
    document.removeEventListener('mouseup', this.onConnectionDrop);
    document.removeEventListener('mousemove', this.onConnectionDrag);
  }

  getBlockRenderObjects(){
    var result = [];
    model.blocks.forEach(block => {
      result.push(<Block Block={block}
                    key={block.Id}
                    OnMouseDown={this.onStartBlockDrag.bind(this)}
                    ComponentWillMount={this.onBlockWillMount.bind(this)}
                    Input={this.hasInput(block.Id, model.blocks)}
                    Output={block.Connects && block.Connects.length>0}
                    OnMouseEnter={this.onEnterToBlock.bind(this)}
                    OnMouseLeave={this.onLeaveBlock.bind(this)}
                    OnStartConnecting={this.onStartConnectionDrag.bind(this)}
                  />);

      Array.prototype.push.apply(result, this.getConnectRenderObjects(block));
    });
    return result;
  }

  hasInput(blockId, allBlocks) {
    return allBlocks.some((block) => {
      return block.Connects.some((connect) =>{
        return connect == blockId;
      })
    });
  }

  getConnectRenderObjects(block){
    return block.Connects.map((connect)=>{
      return <Connection
                key={`${block.Id}_${connect}`}
                StartPoint={getOutputConnectorCoords(block)} 
                EndPoint={getInputConnectorCoords(findBlockById(model.blocks, connect))}
              />
    });
  }

  getUncommittedConnection(){
    var connectedBlock = findBlockById(model.blocks, this.state.connectableParentBlockId);
    if(!connectedBlock){
      return null;
    }

    var positionModel = getPositionModel(connectedBlock,
      this.state.connectionEndPosition,
      this.state.connectionType);
    
    if(!positionModel){
      return null;
    }

    return <Connection
              key={`${this.state.connectableParentBlockId}_no`}
              StartPoint={positionModel.StartPoint}
              EndPoint={positionModel.EndPoint}
           />
  }

  render() {
    var allElements = this.getBlockRenderObjects();
    var elementsToRender = allElements.filter(element => {
      return element.type.name == "Block";
    })
    var connects = allElements.filter(element => {
      return element.type.name == "Connection";
    })
    
    var uncommittedConnection = this.getUncommittedConnection();
    if(uncommittedConnection){
      connects.push(uncommittedConnection);
    }

    if(elementsToRender.length == this.state.renderedBlocksCount){
      Array.prototype.push.apply(elementsToRender, connects)
    }

    return (
      <div className="field">
        {elementsToRender}
      </div>
    );
  }
}

export default Field;