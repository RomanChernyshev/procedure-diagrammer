import React from 'react';
import './Connection.css'

function Connection(props) {
    return (
      <svg className="connect" id={`${props.Start}_${props.End}`}>
            <path d={getBezierPath(props.StartPoint, props.EndPoint)}/>
      </svg>
    );
}

function getBezierPath(start, end){
    var midpointsX = start.x + Math.round((end.x - start.x)/2);
    return `M${start.x},${start.y} `
        + `C${midpointsX},${start.y} `
        + `${midpointsX},${end.y} `
        + `${end.x},${end.y}`;
}

export default Connection;