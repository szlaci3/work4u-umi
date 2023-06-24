import React from 'react';

/*
<Selector
  name="city"
  value={this.state.city}
  disabled={this.state.view === "view"}
  setValue={(name, value) => {this.setState([name]: value)}}
  hasNull={true}
  nullText="Please select" // def:请选择

  options={ ["Oklahoma", "Odessa"] }
  OR
  options={ [{key: 0, value: "Oklahoma"}, {key: 1, value: "Odessa"}] }
/>
*/

class Selector extends React.Component {
  render() {
    return <select id={this.props.id || this.props.name} className={"selector " + (this.props.className || "")} value={this.props.value || ""} disabled={this.props.disabled} onChange={this.handleChange.bind(this)}>
      
      {this.props.hasNull && <option disabled hidden value="">{this.props.nullText || "请选择"}</option>}
      {this.props.options.map(this.eachOption)}
    </select>;
  }

  eachOption(option, i) {
    if (typeof option === "object") {
      return <option key={i} value={option.key}>{option.value}</option>
    } else {
      return <option key={i} value={option}>{option}</option>
    }
  }

  handleChange(ev) {
    this.props.setValue(this.props.name, ev.target.value);
  }
}

export default Selector;