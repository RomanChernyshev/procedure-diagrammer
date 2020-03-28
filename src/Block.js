import React from 'react';
import './Block.css';
import Connector from './Connector'
import '../node_modules/material-design-lite/material.min.css'

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

  onStartConnecting(){
    this.props.OnStartConnecting(this.props.Block.Id)
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
            onMouseDown={(event)=> {
              this.props.OnMouseDown(this.props.Block, getCorrection(this.props.Block.Position, {
                x: event.clientX,
                y: event.clientY
              }))
            }}
            onMouseEnter={this.onMouseEnter.bind(this)}
            onMouseLeave={this.onMouseLeave.bind(this)}
          >
            {(this.props.Input || this.state.hover) &&
              <Connector key={`input_${this.props.Id}`} 
                Radius={connectorRadius} 
                Side="left"
                OnMouseDown={this.onStartConnecting.bind(this)}
              />
            }
            <div className="block-content">
              <span>{this.props.Block.Title}</span>
            </div>
            {(this.props.Output || this.state.hover) &&
              <Connector key={`output_${this.props.Id}`}
                Radius={connectorRadius}
                Side="right"
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