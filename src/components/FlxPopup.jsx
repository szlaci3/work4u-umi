import React from 'react';

// for backw. compat. : If has no title, msg has padding-top instead of title.
class FlxPopup extends React.Component {
  render() {
    return <div className={"popup "+ (this.props.className || "") + (this.props.displayPopup ? "" : " display-none")} >
      <div>
        {this.props.title ? (
          <div>
            <div className="title">{this.props.title}</div>

            <div className="msg2">{this.props.msg}</div>
          </div>
        ) : (
          <div className="msg">{this.props.msg}</div>
        )}
        {this.props.children}

        <div className="button-group1">
          {this.props.closePopup && <button type="button" className="btn-both btn-back" onClick={this.props.closePopup}>{this.props.closeText || "关闭"}</button>}
          <button type="button" className={"btn-both orange" + (this.props.closePopup ? "" : " full-width")} onClick={this.props.confirm} disabled={this.props.disableConfirm}>{this.props.confirmText}</button>
        </div>
      </div>
    </div>
  }

  componentWillUnmount() {
    $('body').removeClass("fixed-body").css({marginTop: 0});
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.keepScrollEnabled && !!this.props.displayPopup != !!nextProps.displayPopup) {
      if (nextProps.displayPopup) {
        this.scrolled = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop || 0;
        $('body').addClass("fixed-body").css({marginTop: - this.scrolled});
      } else {
        $('body').removeClass("fixed-body").css({marginTop: 0});
        $('html, body').scrollTop(this.scrolled);
      }
    }
  }
};

export default FlxPopup;