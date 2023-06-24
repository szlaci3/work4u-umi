import React from 'react';
import { connect } from 'dva';
import FlxPopup from '@/components/FlxPopup.jsx';
import { notification } from 'antd';

{/*
    <FlxSmsAndCaptcha
      className="verification-row"
      btnClassName="button-nylon user-action-sms-verification"
      seconds={60}
      api="/index/index/sendSms"
      finalBtnBg="#fff8ee"
      type={this.props.isCustomer ? 2 : 1}
      // the "label" part of the Phone field :
      renderLabel={onEnterCallback => 
        <input type="text" id="phone" name="phone" placeholder="Please fill in手机号" onKeyDown={this.handlePhoneKeyDown.bind(null, onEnterCallback)} onChange={this.handlePhoneChange} value={this.state.data ? this.state.data.phone : null} />
      }

      mClassName="verification-row"
      mBtnClassName="m-button-denim m-sms-verification"
      mRenderLabel={onEnterCallback => 
        <label className="m-user-label m-verification-label">
          <div className="kernel">手机号</div>
          <div className="icon-phone"/>
          <input type="text" id="phone" name="phone" placeholder="Please fill in..." onKeyDown={this.handlePhoneKeyDown.bind(null, onEnterCallback)} onChange={this.handlePhoneChange} value={this.state.data ? this.state.data.phone : null} />
        </label>
      }

      getPhone={() => this.state.data ? this.state.data.phone : null}
      setVerifyError={this.setVerifyError}
    />

*/}



class FlxSmsAndCaptcha extends React.Component {
  render() {
    let {
      children,

      mClassName,
      mBtnClassName,

      getPhone,
    } = this.props;
    let {
      wait,
      captchaImg,
    } = this.state;

    return <div className={mClassName}>
      <FlxPopup
        msg="Please fill in验证码"
        confirmText="确定"
        closeText="取消"
        confirm={this.checkCaptcha.bind(this)}
        displayPopup={this.state.displayCaptcha}
        closePopup={this.closeCaptcha.bind(this)}
        keepScrollEnabled={true}
        className="m-captcha-popup">

        <div className="m-give-captcha">
          <input type="text" ref="captchaInput" name="captcha" autoFocus={true} autoComplete="off" onKeyDown={this.handleCaptchaKeyDown.bind(this)} onChange={this.handleChange.bind(this)} />
          <div className="captcha-img">
            <img ref="captcha" src={captchaImg}/>
          </div>
          <img className={"captcha-reload " + this.state.reloadClass} src={require("@/img/verif-reload.png")} onClick={this.resendCaptcha.bind(this)} />
        </div>
      </FlxPopup>

      {children}

      {wait === 61 && (
        <button type="button" onClick={this.onClickVerify.bind(this)} className={mBtnClassName}>获取验证码</button>
      )}
      {wait < 61 && wait > 0 && (
        <button type="button" className={mBtnClassName + " counting"} disabled={true} >在{wait}秒后重发</button>
      )}
      {wait === 0 && (
        <button type="button" onClick={this.onClickVerify.bind(this)} className={mBtnClassName}>重发验证码</button>
      )}
    </div>
  }

  constructor(props) {
    super(props);

    this.state = {
      wait: 61,
    };
  }

  handleChange(ev) {
    this.setState({captcha: ev.target.value.trim()});
  }

  handleCaptchaKeyDown(keyEvent) {
    if (keyEvent.key === "Enter") {
      this.checkCaptcha();
    }
  }

  onClickVerify() {
    if (/^\d{11,20}$/.test(this.props.getPhone())) {
      this.checkHuman();
    } else {
      notification.warn({
        className: "erm",
        message: "*Please fill in正确的手机号码~",
        duration: 0,
      });
    }
  }

  checkHuman() {
    if (this.state.isHuman) {
      this.sendSMS();
    } else {
      this.openCaptcha();
    }
  }

  sendSMS() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/sendSMS',
      payload: {
        mobile: this.props.getPhone(),
        id: this.state.captchaId,
        verifyValue: this.state.captcha,
      },
    });
  }

  openCaptcha() {
    this.setState({displayCaptcha: true}, this.resendCaptcha.bind(this, true));
  }

  closeCaptcha() {
    this.setState({displayCaptcha: false});
  }

  resendCaptcha(isFirst) {
    const { dispatch } = this.props;

    if (isFirst !== true) {
      this.setState({reloadClass: "clicked"});
      window.setTimeout(function() {
        this.setState({reloadClass: ""});
      }.bind(this), 300);
    }
    dispatch({
      type: 'global/getCaptcha',
    });
  }

  checkCaptcha() {
    const { dispatch } = this.props;

    dispatch({
      type: 'global/verifyCaptcha',
      payload: JSON.stringify({
        id: this.state.captchaId,
        verifyValue: this.state.captcha,
      }),
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;
    const { sendSMSRes, getCaptchaRes, verifyCaptchaRes } = nextProps;

    if (sendSMSRes) {
      this.setState({wait: 60});
      this.interval = window.setInterval(() => {
        if (!this.state.wait) {
          window.clearInterval(this.interval);
        } else {
          this.setState({wait: this.state.wait - 1});
        }
      }, 1000);
      dispatch({
        type: 'global/doRemoveAll',
      });
    }

    if (getCaptchaRes) {
      if (getCaptchaRes.code === 1) {
        this.setState({
          captchaId: getCaptchaRes.captchaId,
          captcha: null,
          captchaImg: getCaptchaRes.data,
        });
        // this.refs.captchaInput.value = "";
        // this.refs.captchaInput.focus();
      }

      dispatch({
        type: 'global/doRemoveAll',
      });
    }

    if (verifyCaptchaRes) {
      if (verifyCaptchaRes.code === 1) {
        this.setState({isHuman: true, displayCaptcha: false});
        this.sendSMS();
      } else {
        notification.warn({
          className: "erm",
          message: "*请填入正确的验证码~",
          duration: 0,
        });
        this.resendCaptcha();
      }

      dispatch({
        type: 'global/doRemoveAll',
      });
    }
  }
}



export default connect(state => {
  return {
    ...state.global,
  };
})(FlxSmsAndCaptcha);