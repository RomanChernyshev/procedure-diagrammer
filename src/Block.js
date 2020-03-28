import React from 'react';
import '../node_modules/material-design-lite/material.min.css'
import './Block.css';
import Connector from './Connector'
import ConnectionTypesEnum from './ConnectionTypes'

const connectorRadius = 4;
class Block extends React.Component{
  
  constructor(props) {
    super(props);
    this.state = {
      hover: false
    }
  }
  
  componentWillMount(){
    this.props.ComponentWillMount();
  }

  onMouseEnter(){
    this.setState({hover:true});
    this.props.OnMouseEnter(this.props.Block.Id);
  }

  onMouseLeave(){
    this.setState({hover:false})
    this.props.OnMouseLeave()
  }

  onMouseDown(event){
    event.stopPropagation();
    event.preventDefault();
    this.props.OnMouseDown(this.props.Block, getCorrection(this.props.Block.Position, {
      x: event.clientX,
      y: event.clientY
    }))
  }

  onStartConnecting(connectionType){
    this.props.OnStartConnecting(this.props.Block.Id, connectionType)
  }

  render() {
    return (
      <div className="absolute-wrapper" style={{
          left: `${this.props.Block.Position.x - connectorRadius}px`,
          top: `${this.props.Block.Position.y - connectorRadius}px`
      }}>
        <div className="relative-wrapper" style={{
          padding:`${connectorRadius}px`
        }}>
          <div id={this.props.Block.Id}
            className="block mdl-shadow--2dp"
            onMouseDown={this.onMouseDown.bind(this)}
            onMouseEnter={this.onMouseEnter.bind(this)}
            onMouseLeave={this.onMouseLeave.bind(this)}
          >
            {(this.props.Input || this.state.hover) &&
              <Connector key={`input_${this.props.Id}`} 
                Radius={connectorRadius} 
                Type={ConnectionTypesEnum.input}
                OnMouseDown={this.onStartConnecting.bind(this)}
              />
            }
            <div className="block-content">
              <span>{this.props.Block.Title}</span>
            </div>
            {(this.props.Output || this.state.hover) &&
              <Connector key={`output_${this.props.Id}`}
                Radius={connectorRadius}
                Type={ConnectionTypesEnum.output}
                OnMouseDown={this.onStartConnecting.bind(this)}
              />
            }
          </div>
        </div>
      </div>
    );
  }
}

function getCorrection(blockCoords, eventCoords){
  return {
    x: eventCoords.x - blockCoords.x,
    y: eventCoords.y - blockCoords.y
  }
}

export default Block;