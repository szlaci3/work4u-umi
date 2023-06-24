import React from 'react';

class Floader extends React.Component {
  render() {
    return(
      <div className={"floader " + (this.props.className || "")}><div><span>Loading...</span></div></div>
    )
  }
}

export default Floader;