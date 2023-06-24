import PageParent from '@/components/PageParent.jsx';
import { connect } from 'dva';
import { notification } from 'antd';
import Qiniu from 'react-qiniu-2.0';
import { history, Link } from 'umi';

import FlxPopup from '@/components/FlxPopup.jsx';
import Floader from '@/components/Floader.jsx';
import FlxCertificateComponent from '@/components/FlxCertificateComponent.jsx';
import {
  Address,
} from '@/components/FlxElements.jsx';
import {
  hasVal,
  isIOS,
} from '@/utils/utils';


class FlxCompanyForm extends PageParent {
  render() {
    let {data, displayCertificate, displayContactAddress, displayBeforeLeave, isDefaultImage, c_emailError, c_landlineError, c_faxError, c_phoneError} = this.state;
    let isWechatBrowser = window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger';
    let disableSubmit = c_emailError || c_landlineError || c_faxError || !data.c_name || !data.c_contacts || !data.contactCityLine || !data.contactAddressLine;

    let {headimg} = data;
    let large;
    let isCertified = data.c_state === 1;
    
    if (displayCertificate) {
      return <FlxCertificateComponent setValue={this.setValue.bind(this)} toggle={this.toggle.bind(this, "displayCertificate")}/>
    }
    if (displayContactAddress) {
      return <Address title="联系地址" setAddress={this.setContactAddress.bind(this)} toggle={this.toggle.bind(this, "displayContactAddress")} cityDistrict={data.contactCityLine} streetNumber={data.contactAddressLine}/>
    }

    if (headimg) {
      large = headimg.preview || (headimg.key && headimg.key.slice(0, 4) === "http" ? headimg.key.replace("http:", "https:") : (cloud + headimg.key));
      if (headimg.key === "") {
        isDefaultImage = true;
        large = this.defaultHeadImg;
      }
    }

    return <div className={navigator.platform.slice(0,7)}>
      <FlxPopup
        displayPopup={displayBeforeLeave && disableSubmit}
        msg="您还未保存已变更的信息。"
        confirm={history.goBack}
        confirmText="好的"
        />
      <FlxPopup
        displayPopup={displayBeforeLeave && !disableSubmit}
        msg="您还未保存已变更的信息，是否要保存？"
        confirm={this.submit.bind(this)}
        confirmText="保存"
        closePopup={history.goBack}
        closeText="不要"
        cancel__NOT_USED={this.toggle.bind(this, "displayBeforeLeave")}
        />

      <div className="header">
        <div className="header-line">
          <div className="h-left back-btn" onClick={this.openBeforeGoBack.bind(this)} />

          <div className="h-middle">公司完善信息</div>

          <Link className="h-home" to="/"/>
        </div>
      </div>
      <div className="space-lines1"/>

      <div className="bg-f4">
        <div className="sp-icon">
          <div className="sp-img">
            <Qiniu ref="fileInput" className={"sp-inner " + (isDefaultImage ? "" : "fit-box")} style={{opacity: headimg && !headimg.key ? .4 : 1}} token={this.props.uploadTokenRes || ""} onDrop={this.onDrop.bind(this)} multiple={false}>
              <div className="fit-box-inner">
                <img src={large} onError={this.onImgError.bind(this)}/>
              </div>

            </Qiniu>
            {headimg && !hasVal(headimg.key) && <Floader/>}
          </div>
          <div className="dcamera"><div><div onClick={this.triggerUpload.bind(this)}/></div></div>
        </div>
      </div>

      <div className="wide bg-f4 dline1">
        公司信息
      </div>

      <div className="wide most-star bg-white">
        <label className="field" onClick={isCertified ? null : this.toggle.bind(this, "displayCertificate")}>
          <div className="dlabel">公司全称</div>
          <div className="dvalue" style={{width: "79%"}}>{data.c_name}</div>
          <div className={"operation" + (isCertified ? "" : " orange")}>{isCertified ? "企业已认证" : "企业认证"}</div>
        </label>

        <label className="field">
          <div className="dlabel no-star">注册地址</div>
          <div className="dvalue">{data.c_register_address}</div>
        </label>

        <label className="field" onClick={isCertified ? null : this.toggle.bind(this, "displayContactAddress")}>
          <div className="dlabel">联系地址</div>
          <div className="dvalue">{data.contactCityLine} {data.contactAddressLine}</div>
          {isIOS && <div className="go "/>}
        </label>

        <label className="field">
          <div className="dlabel">座机电话</div>
          <input className="dvalue" type="text" name="c_landline" value={data.c_landline || ""} onKeyDown={this.handlePhoneKeyDown.bind(this, "座机电话", "c_landlineError")} onChange={this.handleChange} disabled={isCertified}/>
          <div className="error">{c_landlineError}</div>
        </label>

        <label className="field">
          <div className="dlabel">传真号码</div>
          <input className="dvalue" type="text" name="c_fax" value={data.c_fax || ""} onKeyDown={this.handlePhoneKeyDown.bind(this, "传真号码", "c_faxError")} onChange={this.handleChange} disabled={isCertified}/>
          <div className="error">{c_faxError}</div>
        </label>

        <label className="field">
          <div className="dlabel">邮箱</div>
          <input className="dvalue" type="text" name="c_email" value={data.c_email || ""} onKeyDown={this.handleEmailKeyDown.bind(this)} onChange={this.handleChange} disabled={isCertified}/>
          <div className="error">{c_emailError}</div>
        </label>

        <label className="field">
          <div className="dlabel">联系人姓名</div>
          <input className="dvalue" type="text" name="c_contacts" value={data.c_contacts || ""} onChange={this.handleChange} disabled={isCertified}/>
        </label>

        <label className="field">
          <div className="dlabel">手机号码</div>
          <input className="dvalue" type="text" name="c_phone" value={data.c_phone || ""} onKeyDown={this.handlePhoneKeyDown.bind(this, "手机号码", "c_phoneError")} onChange={this.handleChange} disabled={isCertified}/>
          <div className="error">{c_phoneError}</div>
        </label>

        <label className="field">
          <div className="dlabel no-star">个人简介</div>
          {!isCertified && <div className="dcount">{(data.c_introduction ? data.c_introduction.length : 0) + " / 100"}</div>}
          <div className="dvalue has-goals full">
            <div className="goals-wrapper">
              <textarea id="goals" className="goals" name="c_introduction" value={data.c_introduction || ""} onChange={this.handleGoalsChange.bind(this)} onKeyUp={this.handleGoalsKeyUp.bind(this)} disabled={isCertified}/>
              <div id="goalsdiv" className="goals">{data.c_introduction}</div>
            </div>
          </div>
        </label>
      </div>

      {!isCertified && <div className="limit-box bg-f4 near-down">
        <button type="button" className="btn2" onClick={this.submit.bind(this)} disabled={disableSubmit}>信息提交</button>
      </div>}
    </div> 
  }

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.defaultHeadImg = require("@/img/flx8.png");

    this.state = {data: {}};
  }

  openBeforeGoBack() {
    if (this.state.hasUnsavedData) {
      this.setState({displayBeforeLeave: true, isBackBtnClicked: true});
    } else {
      history.goBack();
    }
  }

  onImgError(ev) {
    ev.target.src = this.defaultHeadImg;
    this.setState({isDefaultImage: true});
  }

  triggerUpload() {
    this.refs.fileInput.onClick();
  }

  handleChange(ev) {
    let {data} = this.state;
    data[ev.target.name] = ev.target.value;
    this.setState({data, hasUnsavedData: true});
  }

  handleGoalsChange(ev) {
    if (ev.target.value.length <= 100) {
      this.handleChange(ev);
    }
  }

  handleGoalsKeyUp(ev) {
    let height = $("#goalsdiv").height();
    height = height + (ev.key === "Enter" ? 18 : 0);
    $("#goals").height(height);
  }

  setValue(name, value) {
    let {data} = this.state;
    data[name] = value;
    this.setState({data, hasUnsavedData: true});
  }

  setContactAddress(cityDistrict, streetNumber) {
    let {data} = this.state;
    data.contactCityLine = cityDistrict;
    data.contactAddressLine = streetNumber;
    this.setState({data, hasUnsavedData: true});
  }

  handlePhoneKeyDown(labelText, errorName, keyEvent) {
    const validatePhone = (ev) => {
      let reg = /^[- \+\d]{11,22}$/;
      let isOk = reg.test(ev.target.value);
      if (!isOk) {
        this.setState({[errorName]: "请输入正确的" + labelText});
      } else {
        this.setState({[errorName]: null});
      }
    }

    if (keyEvent.key === "Enter") {
      validatePhone(keyEvent);
    }
    keyEvent.target.onblur = validatePhone;
  }

  handleEmailKeyDown(keyEvent) {
    const validateEmail = (ev) => {
      let reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
      let isOk = reg.test(ev.target.value);
      if (!isOk) {
        this.setState({c_emailError: "请输入正确的邮箱"});
      } else {
        this.setState({c_emailError: null});
      }
    }

    if (keyEvent.key === "Enter") {
      validateEmail(keyEvent);
    }
    keyEvent.target.onblur = validateEmail;
  }

  onDrop(files) {
    const { dispatch } = this.props;
    let {data} = $.extend(true, {}, this.state);
    data.headimg = files[0];
    // when upload response will come, add the file location to the existing files in state. 
    if (files[0].size > 5242880) {
      notification.warn({
        className: "erm",
        message: "很抱歉，文件大小不能超过5MB哦~",
        duration: 0,
      });
      return;
    }
    if (files[0].type !== "image/jpg" && files[0].type !== "image/jpeg" && files[0].type !== "image/png" && files[0].type !== "image/gif") {
      notification.warn({
        className: "erm",
        message: "您上传的文件类型有误，请上传JPG、GIF、PNG格式的文件~",
        duration: 0,
      });
      return;
    }

    if (!files[0].key) {
      files[0].uploadPromise.done(res => {
        let {data} = this.state;
        data.headimg.key = res.body.name && res.body.name.key || res.body.key;
        this.setState({data, isImgSaving: true});
        dispatch({
          type: "companyForm/save",
          payload: {c_profile: data.headimg.key},
        });
      });
    }

    this.setState({data, isDefaultImage: false});
  }

  toggle(name) {
    let adjustGoalsHeight = !!this.state[name]; // adjust goals height when coming back from other views
    this.setState({[name]: !this.state[name]},
      adjustGoalsHeight ? () => {
        this.handleGoalsKeyUp({});
      } : null
    );
  }

  submit() {
    const { dispatch } = this.props;
    let {data} = this.state;
    data.c_contact_address = data.contactCityLine + " " + data.contactAddressLine;
    data.c_profile = data.c_profile ? (data.c_profile.key || data.c_profile) : {};
    data.type = 0;

    dispatch({
      type: "companyForm/save",
      payload: data,
    });
  }

  componentDidMount() {
    $('html').scrollTop(0);
    this.checkLoginToken(this.startUp.bind(this));
  }

  startUp() {
    const { dispatch } = this.props;
    dispatch({
      type: "companyForm/getInfo",
    });
    if (!this.props.uploadTokenRes) {
      dispatch({
        type: "global/getUploadToken",
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: "companyForm/doRemoveAll",
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;

    // use this if u want in dev to not lose data when server auto-loads page:
    if (nextProps.data && (!this.state.data || !this.props.data)) {
    // this can be same or better, but lose data:
    // if (nextProps.data && !this.props.data) {
      let {data = {}} = nextProps;
      data.headimg = data.c_profile ? {key: data.c_profile} : null;
      if (data.c_contact_address) {
        let addressParts = data.c_contact_address.split(" ");
        data.contactCityLine = addressParts.slice(0, 3).join(" ");
        data.contactAddressLine = addressParts.slice(3).join(" ");
      }
      this.setState({data}, () => {
        this.handleGoalsKeyUp({});// height for existing text
      });
    }

    if (nextProps.saveRes && !this.props.saveRes) {
      if (this.state.displayBeforeLeave) {
        if (this.state.isBackBtnClicked) {
          this.setState({isBackBtnClicked: false, hasUnsavedData: false});
          history.goBack();
        } else {
          this.setState({hasUnsavedData: false});
          this.goToCompanyForm();
        }
      } else if (this.state.isImgSaving) {
        dispatch({
          type: "companyForm/doRemoveSaveRes",
        });
        this.setState({hasUnsavedData: false, isImgSaving: false});
      } else if (!this.state.displayCertificate) {// this.toggle: open certif. if api called from certif, dont close
        dispatch({
          type: "companyForm/doRemoveSaveRes",
        });

        this.setState({hasUnsavedData: false});
        
        this.toggle("displayCertificate");
      }
    }
  }
};


export default connect(state => {
  return {
    ...state.companyForm, // means these and more:
    // data: state.companyForm.data,
    // saveRes: state.companyForm.saveRes,
    uploadTokenRes: state.global.uploadTokenRes,
  };
})(FlxCompanyForm);