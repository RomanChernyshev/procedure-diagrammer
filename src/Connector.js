import React from 'react';
import "./Connector.css"

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
    this.props.OnMouseDown();
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
          left: getHorisontalPosition(this.props.Side, this.getRadius())
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

function getHorisontalPosition(side, radius){
  if(!side){
    return 0;
  }
  return side == "left" 
    ? 0
    : side == "right" ? `calc(100% - ${radius*2}px)` : 0;
}
export default Connector;