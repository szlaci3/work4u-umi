import React from 'react';

// example:
//       <Checkbox
//         className="keygo-auto" 
//         type="checkbox2"
//         name="_200" // can't be number
//         checked={this.state.wannadance == 1}
//         handleChange={this.handleChange}
//         label="上级  （ 自动设置组织架构当中的上级领导为审批人 ）"

  // OPTIONAL:
  //       option={200} // can be same as name; number is allowed
  //       fieldName="field3" // if handleCHange needs to identify which group of checkboxes
//       />

class Checkbox extends React.Component {
  render() {
    return (
      <label className={this.props.className || null}>
        <input type="checkbox" name={this.props.name} id={this.props.name} data-fieldname={this.props.fieldName} data-option={this.props.option} className={this.props.type + "_type"} checked={this.props.checked} disabled={this.props.disabled} onChange={this.props.handleChange}/> 
        <label htmlFor={this.props.name} className={this.props.type + "_style"}/>
        {this.props.label}
      </label>
    )
  }
}

export default Checkbox;