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
          Size:{
            height: 30,
            width: 50,
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
          Size:{
            height: 30,
            width: 70,
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

class Field extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      draggedObj: null,
      correction: null,
      renderedBlocksCount:0
    };
  }

  componentWillUnmount(){
    this.removeListeners();
  }

  onMouseDown(block, correction) {
    this.setState({
      draggedObj: block,
      correction: correction
    });
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  } 

  onMouseUp(){
    this.removeListeners();
    this.setState({
      draggedObj: null
    });
  }

  onMouseMove(event){
    if(!this.state.draggedObj){
      return;
    }
    this.updateBlockPosition(event);
    event.stopPropagation();
    event.preventDefault();
    this.forceUpdate();
  }

  updateBlockPosition(event) {
    var targetBlock = model.blocks.find((block)=>{return block.Id == this.state.draggedObj.Id});
    targetBlock.Position.x = event.clientX - this.state.correction.x;
    targetBlock.Position.y = event.clientY - this.state.correction.y;
  }

  getBlockRenderObjects(){
    var result = [];
    model.blocks.forEach(block => {
      result.push(<Block Block={block}
                    key={block.Id}
                    OnMouseDown={this.onMouseDown.bind(this)}
                    ComponentWillMount={this.onBlockWillMount.bind(this)}
                    Input={this.hasInput(block.Id, model.blocks)}
                    Output={block.Connects && block.Connects.length>0}
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

  onBlockWillMount(){
    this.setState({renderedBlocksCount: ++this.state.renderedBlocksCount})
  }

  getConnectRenderObjects(block){
    return block.Connects.map((connect)=>{
      return <Connection
                key={`${block.Id}_${connect}`}
                StartPoint={this.getOutputConnectorCoords(block)} 
                EndPoint={this.getInputConnectorCoords(model.blocks.find((block)=>
                  {return block.Id == connect;}))}
              />
    });
  }

  render() {
    var allElements = this.getBlockRenderObjects();
    var elementsToRender = allElements.filter(element => {
      return element.type.name == "Block";
    })
    var connects = allElements.filter(element => {
      return element.type.name == "Connection";
    })

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

  removeListeners(){
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }
}

export default Field;
