import React from 'react';
import {
  hasVal,
} from '@/utils/utils';

// example:
//       <Radio
//         mainClass="keygo-auto" 
//         optionClass="spaced-radio" 
//         type="radio2"
//         name="type"
//         default={this.state.autoSuperior}
//         value={this.state.autoSuperior}
//         handleRadio={this.handleRadio}
//         disabled={true} // disable group
//         options={[
//           {label: "上级  （ 自动设置组织架构当中的上级领导为审批人 ）", value: "true"},
//           {label: "单个成员", value: "false"}
//         ]}
//       />

class Radio extends React.Component {
  render() {
    return <div className={this.props.mainClass || null}>
      {this.props.options && this.props.options.map(this.eachOption.bind(this))}
    </div>
  }

  constructor(props) {
    super(props);

    this.state = {value: hasVal(props.default) ? props.default : props.value};
  }

  eachOption(option, i) {
    if (typeof option === "string" || typeof option === "number") {
      option = {label: option, value: option};
    }
    // div is useful for putting each option in a separate line, while the clickable label is inline 
    return <div className={"radio " + (this.props.optionClass || "") + (this.props.disabled || option.disabled ? " disabled" : "")} key={i}>
      <label>
        <input type="radio" id={this.props.name + i} className={this.props.type + "_type"} name={this.props.name} value={option.value} checked={option.value == this.state.value} disabled={this.props.disabled || option.disabled} onChange={this.handleRadio.bind(this)}/> 
        <label htmlFor={this.props.name + i} className={this.props.type + "_style"}/>
        {option.label}
      </label>
    </div>
  }

  handleRadio(ev) {
    this.setState({value: ev.target.value});
    this.props.handleRadio && this.props.handleRadio(ev);
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    this.setState({value: newProps.value});
  }
}

export default Radio;