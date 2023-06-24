import React from 'react';
import {
  cssAddFixed,
  cssRemoveFixed,
} from '@/utils/utils';
     
class FlxErrorPopup extends React.Component {
  render() {
    return <div className={"error-popup" + (this.props.errorMsg ? "" : " display-none")}>
      <div>
        <div className="error-msg">{this.props.errorMsg}</div>

        <div className="button-group1">
          <button className="btn-back" onClick={this.closePopup.bind(this)}>关闭</button>
        </div>
      </div>
    </div>
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.keepScrollEnabled && !!this.props.errorMsg != !!nextProps.errorMsg) {
      if (nextProps.errorMsg) {
        cssAddFixed();
      } else {
        cssRemoveFixed();
      }
    }
  }

  closePopup() {
    this.props.that.setState({errorMsg: null});
  }
};

export default FlxErrorPopup;