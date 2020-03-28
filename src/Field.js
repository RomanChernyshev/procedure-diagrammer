import React from 'react';
import './Field.css';
import Block from './Block';
import Connection from './Connection';

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
          Title: "ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
          Position:{
              x: 700,
              y: 100
          },
          Connects:[]
      },
      {
        Id: 3,
        Title: "abcd",
        Position:{
            x: 670,
            y: 350
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

class Field extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      draggedObj: null,
      correction: null,
      renderedBlocksCount:0,
    };
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
    document.addEventListener('mousemove', this.onBlockDrag.bind(this));
    document.addEventListener('mouseup', this.onBlockDrop.bind(this));
  } 

  onBlockDrop(){
    this.removeBlockDndListeners();
    this.setState({
      draggedObj: null
    });
  }

  onBlockDrag(event){
    if(!this.state.draggedObj){
      return;
    }
    this.updateBlockPosition(event);
    event.stopPropagation();
    event.preventDefault();
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

  onStartConnectionDrag(blockId){
    if(!blockId){
      return;
    }
    this.setState({
      connectableParentBlockId: blockId 
    });
    document.addEventListener('mouseup', this.onConnectionDrop.bind(this));
    document.addEventListener('mousemove', this.onConnectionDrag.bind(this));
  }

  onConnectionDrop(){
    var startBlock = findBlockById(model.blocks, this.state.connectableParentBlockId);
    
    if (
      startBlock 
      && this.state.targetConnectableBlockId
      && this.state.connectableParentBlockId != this.state.targetConnectableBlockId
      && !hasConntection(startBlock, this.state.targetConnectableBlockId)
    ) {
      startBlock.Connects.push(this.state.targetConnectableBlockId);
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
                StartPoint={this.getOutputConnectorCoords(block)} 
                EndPoint={this.getInputConnectorCoords(findBlockById(model.blocks, connect))}
              />
    });
  }

  getUncommittedConnection(){
    if(!this.state.connectableParentBlockId || !this.state.connectionEndPosition){
      return null;
    }
    return <Connection
              key={`${this.state.connectableParentBlockId}_no`}
              StartPoint={this.getOutputConnectorCoords(
                findBlockById(model.blocks, this.state.connectableParentBlockId))}
              EndPoint={this.state.connectionEndPosition}
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
  
  // вот это куда-то бы перенести
  getInputConnectorCoords = (block) => {
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

  getOutputConnectorCoords = (block) => {
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
}

export default Field;