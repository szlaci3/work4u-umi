import PageParent from '@/components/PageParent.jsx';
import { Link } from 'umi';
// import { connect } from 'dva';
import { notification } from 'antd';
import Checkbox from '@/components/Checkbox.jsx';
import { history } from 'umi';

class FlxLoginComponent extends PageParent {
  render() {
    if (sessionStorage.loginExpired) {
      return <div/> 
    } else {
      return <div className={navigator.platform.slice(0,7)}>
        <div className="header">
          <div className="header-line no-border">
            <div className="h-left back-btn" onClick={history.goBack}/>

            <Link className="h-right orange" to="/register">Register</Link>
          </div>
        </div>

        <Link to="/">
          <img className="social-circle" src={require("@/img/flx1.png")} alt="" />
        </Link>
        <form className="limit-box">
          <div className="aline1">
            Hello,<br/>
            Welcome to the Work4u flexible employment platform
          </div>
          <label className="user-field">
            <span>Username</span>
            <input type="text" id="phone" name="phone" onKeyDown={this.handleKeyDown} onChange={this.handleChange} defaultValue={this.state.data ? this.state.data.phone : null} placeholder="Choose some name" autoComplete={!!window.chrome && !!window.chrome.webstore ? "new-password" : "on"}/>
          </label>
          <label className="user-field">
            <span>Password</span>
            <input type="password" id="password" name="password" onKeyDown={this.handleKeyDown} onChange={this.handleChange} placeholder="22"/>
          </label>

          <label className="user-field">
            <span>Verification code</span>
            <input type={this.state.data.verification ? "text" : "password"} id="verification" name="verification" onKeyDown={this.handleKeyDown} onChange={this.handleChange} placeholder="Fill in" ref="verificationInput" className="vcode" autoComplete="new-password"/>
            <div className="m-verification-img">
              <img ref="verify" id="verify-img" src={require("@/img/verify.png")}/>
            </div>
          </label>
          
          <div className="user-buttons">
            <button type="button" className="btn2" onClick={this.login.bind(this)} disabled={!this.state.data.userAgreement || this.state.isPendingResponse}>Log in</button>
          </div>

          <div className="m-user-agreement">
            <Checkbox
              type="checkbox"
              name="userAgreement"
              checked={this.state.data && this.state.data.userAgreement}
              handleChange={this.handleAgreementChange.bind(this)}
              label={<div>Please read our <Link to="/user-agreement/login" >User Agreement</Link></div>}
            />
          </div>
          <div className="aforgot">
            <Link className="orange" to="/forgot-password">Forgot your password?</Link>
          </div>
        </form>
      </div>
    }
  }

  constructor() {
    super();

    if (sessionStorage.loginExpired == "1") {
      sessionStorage.setItem("loginExpired", "2");
      location.reload();
    } else if (sessionStorage.loginExpired == "2") {
      notification.warn({
        className: "erm",
        message: "Please log in",
        duration: 3,
      });
      sessionStorage.removeItem("loginExpired");
    }

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChange = this.handleChange.bind(this);

    // ua to be false only if it was manually set to false. Get this boolean and set userAgreement's value to it both on localStorage and state.
    // for iOS private browsing all localStorage statements should be inside a try{}.
    try {
      var ua = (window.localStorage && window.localStorage.userAgreement === "false") ? false : true;
      window.localStorage && window.localStorage.setItem("userAgreement", ua);
      var phone = window.localStorage && window.localStorage.phone;
    } catch(e) {}
    this.state = {
      data: {
        phone: phone,
        userAgreement: ua
      }, 
    };
  }

  handleChange(event) {
    /* if autocomplete changes the field, update the state: */
    let {data} = this.state;
    data[event.target.name] = event.target.value;
    this.setState({data: data});
  }

  handleAgreementChange(event) {
    try {
      if(window.localStorage) {
        let {data} = this.state;
        data[event.target.name] = event.target.checked;
        this.setState({data: data});
        window.localStorage.setItem("userAgreement", event.target.checked);
      }
    } catch(e) {}
  }

  handleKeyDown(keyEvent) {
    let that = this;
    if (keyEvent.key === "Enter" && this.state.data.userAgreement) {
      let data = this.state.data ? this.state.data : {};
      data[keyEvent.target.name] = keyEvent.target.value.trim();
      that.setState({data: data});
      this.login(); //tries to login, will do only if all data is collected.
    }
    keyEvent.target.onblur = function(blurEvent) {
      let data = that.state.data ? that.state.data : {};
      data[blurEvent.target.name] = blurEvent.target.value.trim();
      that.setState({data: data});
    };
  }

  login() {
    if (!this.state.data.phone) {
      notification.warn({
        className: "erm",
        message: "*Phone is wrong format.",
        duration: 0,
      });
    } else if (!this.state.data.password) {
      notification.warn({
        className: "erm",
        message: "*Please fill in your password",
        duration: 0,
      });
    } else if (!this.state.data.verification) {
      notification.warn({
        className: "erm",
        message: "*Please fill in the correct verification code",
        duration: 0,
      });
    } else {
      this.setState({isPendingResponse: true});
      // const { dispatch } = this.props;
      // dispatch({
      //   type: 'login/login',
      //   payload: {
      //     loginUsername: this.state.data.phone,
      //     loginPassword: this.state.data.password,
      //     loginVerify: this.state.data.verification,
      //     userType: 1,
      //   },
      // });
    }
  }

  componentWillUnmount() {
    // const { dispatch } = this.props;
    // dispatch({
    //   type: 'login/doRemoveAll',
    // });
  }

  // UNSAFE_componentWillReceiveProps(nextProps) {
  //   const { dispatch } = this.props;
  //   const { loginRes } = nextProps;
  //   if (loginRes && !this.props.loginRes) {
  //     this.setState({isPendingResponse: false});
  //     if (loginRes.status) {
  //       if (loginRes.data && loginRes.data.token) {
  //         sessionStorage.setItem('logintoken', loginRes.data.token);
  //       }
  //       if (sessionStorage.afterLogin) {
  //         history.push(sessionStorage.afterLogin);
  //         sessionStorage.removeItem('afterLogin');
  //       } else {
  //         history.push('/');
  //       }
  //     } else {
  //       notification.warn({
  //         className: "erm",
  //         message: `*${loginRes.info || "Request error"}`,
  //         duration: 2,
  //       });
  //       dispatch({
  //         type: 'login/doRemoveAll',
  //       });
  //     }
  //   }
  // }
}

export default FlxLoginComponent;
// export default connect(state => {
//   return {
//     loginRes: state.login.loginRes,
//   };
// })(FlxLoginComponent);