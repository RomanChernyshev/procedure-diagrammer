import React from 'react';
import "./Connector.css"
import ConnectionTypesEnum from './ConnectionTypes'

class Connector extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      hover: false
    }
  }

  onMouseEnter(){
    this.setState({hover:true});
  }

  onMouseLeave(){
    this.setState({hover:false})
  }

  onMouseDown(event){
    event.stopPropagation();
    event.preventDefault();
    this.props.OnMouseDown(this.props.Type);
  }

  getRadius(){
    return this.state.hover ? this.props.Radius*1.2 : this.props.Radius
  }

  render() {
    return (
      <svg className="connector" style={{
          width: `${this.getRadius()*2}px`,
          height: `${this.getRadius()*2}px`,
          top: `calc(50% - ${this.getRadius()}px)`,
          left: getHorisontalPosition(this.props.Type, this.getRadius())
        }}
        onMouseEnter={this.onMouseEnter.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        onMouseDown={this.onMouseDown.bind(this)}
      >
            <circle cx={this.getRadius()} 
              cy={this.getRadius()}
              r={this.getRadius()}/>
      </svg>
    );
  }
}

function getHorisontalPosition(type, radius){
  return type == ConnectionTypesEnum.input
    ? 0
    : type == ConnectionTypesEnum.output ? `calc(100% - ${radius*2}px)` : 0;
}
export default Connector;