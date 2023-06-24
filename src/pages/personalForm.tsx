import PageParent from '@/components/PageParent.jsx';
import { connect } from 'dva';
import { notification } from 'antd';
import Qiniu from 'react-qiniu-2.0';
import { history, Link } from 'umi';

import FlxPopup from '@/components/FlxPopup.jsx';
import Floader from '@/components/Floader.jsx';
import {
  NameValidation,
  CardValidation,
  Address,
} from '@/components/FlxElements.jsx';
import {
  hasVal,
} from '@/utils/utils';


class FlxPersonalForm extends PageParent {
/*
Form is unchanged, goBack or goToCompanyForm is clicked:
  leave page.
Form is changed but some must fields are empty:
  Show first FlxPopup, and on click leave page.
Form is changed and all must fields are filled:
  Show second FlxPopup, on click No leave page. Click Yes call submit, then leave page.
*/

  render() {
    let {data = {}, displayNameValidation, displayCardValidation, displayAddress, displayBeforeLeave, isBackBtnClicked, isIdentityBeingChecked} = this.state;
    // isIdentityBeingChecked: dont save before birthday is updated
    // let isWechatBrowser = window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger';
    let disableSubmit = isIdentityBeingChecked || !data.member_nickname || !data.member_name || !data.member_identity || !data.member_phone || !data.member_address || !data.member_detailed_address;

    let {headimg} = data;
    let large;
    let defaultHeadImg = require("@/img/flx7.png");
    let isAuthen = data.member_authentication == 1;

    if (displayNameValidation) {
      return <NameValidation toggle={this.toggle.bind(this, "displayNameValidation")} toggleCardValidation={this.toggle.bind(this, "displayCardValidation")}/>
    }
    if (displayCardValidation) {
      return <CardValidation toggle={this.toggle.bind(this, "displayCardValidation")} member_bank_photo_front={data.member_bank_photo_front} member_bank_photo_back={data.member_bank_photo_back}/>
    }
    if (displayAddress) {
      return <Address title="联系地址" setAddress={this.setAddress.bind(this)} toggle={this.toggle.bind(this, "displayAddress")} cityDistrict={data.member_address} streetNumber={data.member_detailed_address}/>
    }

    if (headimg) {
      large = headimg.preview || (headimg.key && headimg.key.slice(0, 4) === "http" ? headimg.key.replace("http:", "https:") : (cloud + headimg.key));
      if (headimg.key === "") {
        large = defaultHeadImg;
      }
    }

    return <div className={"personal-form " + (navigator.platform.slice(0,7))}>
      <FlxPopup
        displayPopup={displayBeforeLeave && disableSubmit}
        msg="您还未保存已变更的信息。"
        confirm={isBackBtnClicked ? history.goBack : this.goToCompanyForm}
        confirmText="好的"
        />
      <FlxPopup
        displayPopup={displayBeforeLeave && !disableSubmit}
        msg="您还未保存已变更的信息，是否要保存？"
        confirm={this.submit.bind(this)}
        confirmText="保存"
        closePopup={isBackBtnClicked ? history.goBack : this.goToCompanyForm}
        closeText="不要"
        cancel__NOT_USED={this.toggle.bind(this, "displayBeforeLeave")}
        />

      <div className="header">
        <div className="header-line">
          <div className="h-left back-btn" onClick={this.openBeforeGoBack.bind(this)} />

          <div className="h-middle">完善信息</div>

          <Link className="h-home" to="/"/>
        </div>
      </div>
      <div className="space-lines1"/>

      <div className="bg-f4">
        <div className="sp-icon">
          <div className="img-wrapper">
            <Qiniu ref="fileInput" className="dimg" style={{opacity: headimg && !headimg.key ? .4 : 1}} token={this.props.uploadTokenRes || ""} onDrop={this.onDrop.bind(this)} multiple={false}>
              <img src={large} onError={(ev) => {ev.target.src = defaultHeadImg}}/>

            </Qiniu>
            {headimg && !hasVal(headimg.key) && <Floader/>}
          </div>
          <div className="dcamera"><div><div onClick={this.triggerUpload.bind(this)}/></div></div>
        </div>
      </div>

      <div className="wide bg-f4 dline1">
        基本信息
      </div>

      <div className="wide most-star">
        <label className="field">
          <div className="dlabel">昵称</div>
          <input className="dvalue" type="text" name="member_nickname" value={data.member_nickname || ""} onChange={this.handleChange}/>
        </label>

        <label className="field">
          <div className="dlabel">姓名</div>
          <input className="dvalue" type="text" name="member_name" value={data.member_name || ""} onChange={this.handleChange} disabled={isAuthen}/>
        </label>

        <label className="field">
          <div className="dlabel">身份证</div>
          <input className="dvalue" type="text" name="member_identity" value={data.member_identity || ""} onKeyUp={this.handleIdentityKeyUp.bind(this)} onChange={this.handleChange} disabled={isAuthen}/>
        </label>

        <div className="field">
          <div className="dlabel">性别</div>
          <div className="dvalue disabled-color">{data.member_sex}</div>
        </div>

        <label className="field">
          <div className="dlabel">生日</div>
          <div className="dvalue disabled-color">{data.member_birthday}</div>
        </label>

        <label className="field">
          <div className="dlabel">手机号</div>
          <div className="dvalue disabled-color">{data.member_phone}</div>
        </label>

        <label className="field" onClick={this.toggle.bind(this, "displayAddress")}>
          <div className="dlabel">联系地址</div>
          <div className="dvalue">{data.member_address} {data.member_detailed_address}</div>
          <div className="go "/>
        </label>

        <label className="field" onClick={disableSubmit || data.member_authentication !== 0 ? null : this.openNameValidation.bind(this)}>
          <div className="dlabel">实名认证</div>
          <div className={"dvalue" + (disableSubmit || data.member_authentication !== 0 ? " disabled-color" : "")}>{data.member_authentication == 0 ? "未认证" : "已认证"}</div>
          {data.member_authentication == 0 && (
            disableSubmit ? (
              <div className="mention">请先完成标*的必填项</div>
            ) : (
              <div className="operation orange">实名认证</div>
            )
          )}
        </label>

        <label className="field" onClick={disableSubmit ? null : this.openCardValidation.bind(this)}>
          <div className="dlabel">银行卡信息</div>
          <div className="dvalue">{data.member_bank_authentication == 0 ? "未上传" : "已上传"}</div>
          {disableSubmit ? (
            <div className="mention">请先完成标*的必填项</div>
          ) : (
            <div className="go "/>
          )}
        </label>

        <label className="field">
          <div className="dlabel no-star">个人简介</div>
          <div className="dcount">{(data.member_introduction ? data.member_introduction.length : 0) + " / 100"}</div>
          <div className="dvalue has-goals full">
            <div className="goals-wrapper">
              <textarea id="goals" className="goals" name="member_introduction" value={data.member_introduction || ""} onChange={this.handleGoalsChange.bind(this)} onKeyUp={this.handleGoalsKeyUp.bind(this)}/>
              <div id="goalsdiv" className="goals">{data.member_introduction}</div>
            </div>
          </div>
        </label>
      </div>

      <div className="wide bg-f4">
        <span className="dnotice1">公司信息</span>
        <span className="dnotice2">（个人无需填写公司信息！）</span>
      </div>

      <div className="wide">
        <label className="field" onClick={disableSubmit ? null : this.openBeforeLeave.bind(this)}>
          <div className="dlabel">公司信息</div>
          <div className="dvalue">{data.company}</div>
          {disableSubmit ? (
            <div className="mention">请先完成标*的必填项</div>
          ) : (
            <div className="go "/>
          )}
        </label>
      </div>

      <div className="limit-box bg-f4 near-down">
        <button type="button" className="btn2" disabled={disableSubmit || this.state.isBeingSaved} onClick={this.submit.bind(this)}>信息提交</button>
      </div>
    </div> 
  }

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);

    this.state = {};
  }

  handleIdentityKeyUp(keyEvent) {
    this.setState({isIdentityBeingChecked: true});
    if (keyEvent.key === "Enter") {
      this.identityValidation(keyEvent.target);
    }
    keyEvent.target.onblur = (ev) => this.identityValidation(ev.target);
  }

  identityValidation(target) {
    this.setValue("member_identity", target.value);
    const { dispatch } = this.props;
    dispatch({
      type: "personalForm/chackIdentity",
      payload: {identity: target.value},
    });
  }

  openBeforeLeave() {
    if (this.state.hasUnsavedData) {
      this.setState({displayBeforeLeave: true});
    } else {
      this.goToCompanyForm();
    }
  }

  openBeforeGoBack() {
    if (this.state.hasUnsavedData) {
      this.setState({displayBeforeLeave: true, isBackBtnClicked: true});
    } else {
      history.goBack();
    }
  }

  goToCompanyForm() {
    history.push('/company-form');
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

  setAddress(cityDistrict, streetNumber) {
    let {data} = this.state;
    data.member_address = cityDistrict;
    data.member_detailed_address = streetNumber;
    this.setState({data, hasUnsavedData: true});
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
          type: "personalForm/save",
          payload: {member_profile: data.headimg.key},
        });

      });
    }

    this.setState({data});
  }

  toggle(name) {
    let adjustGoalsHeight = !!this.state[name]; // adjust goals height when coming back from other views
    this.setState({[name]: !this.state[name]},
      adjustGoalsHeight ? () => {
        this.handleGoalsKeyUp({});
      } : null
    );
  }

  openNameValidation() {
    if (this.state.hasUnsavedData) {
      this.setState({planDisplayNameValidation: true});
      this.submit();
    } else {
      this.setState({displayNameValidation: true});
    }
  }

  openCardValidation() {
    if (this.state.hasUnsavedData) {
      this.setState({planDisplayCardValidation: true});
      this.submit();
    } else {
      this.setState({displayCardValidation: true});
    }
  }

  submit() {
    let {data} = this.state;
    const { dispatch } = this.props;
    let query = {
      member_nickname: data.member_nickname,
      member_name: data.member_name,
      member_identity: data.member_identity,
      member_sex: data.member_sex,
      member_birthday: data.member_birthday,
      member_phone: data.member_phone,
      member_address: data.member_address,
      member_detailed_address: data.member_detailed_address,
      member_introduction: data.member_introduction,
    }
    this.setState({isBeingSaved: true});

    dispatch({
      type: "personalForm/save",
      payload: query,
    });
  }

  componentDidMount() {
    $('html').scrollTop(0);
    this.checkLoginToken(this.startUp.bind(this));
  }

  startUp() {
    const { dispatch } = this.props;
    dispatch({
      type: "personalForm/getInfo",
    });
    if (!this.props.uploadTokenRes) {
      dispatch({
        type: "global/getUploadToken",
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({type: "personalForm/doRemoveAll"});
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let {dispatch} = this.props;

    // use this if u want in dev to not lose data when server auto-loads page:
    if (nextProps.data && (!this.state.data || !this.props.data)) {
    // this can be same or better, but lose data:
    // if (nextProps.data && !this.props.data) {
      let {data = {}} = nextProps;
      data.member_sex = data.member_sex == 1 ? "男" : "女";
      data.headimg = {key: data.member_profile};
      this.setState({data}, () => {
        this.handleGoalsKeyUp({});// height for existing text
      });
    }

    if (nextProps.identityRes && !this.props.identityRes) {
      this.setValue("member_birthday", nextProps.identityRes.birth);
      this.setValue("member_sex", nextProps.identityRes.sex);
      this.setState({isIdentityBeingChecked: false});
      dispatch({
        type: "personalForm/doRemoveIdentityRes",
      });
    }

    if (nextProps.saveRes && !this.props.saveRes) {
      if (this.state.displayBeforeLeave) {
        if (this.state.isBackBtnClicked) {
          this.setState(
            {displayBeforeLeave: false, isBackBtnClicked: false, hasUnsavedData: false},
            () => {
              $('html, body').scrollTop(0);
              history.goBack();
            }
          );
        } else {
          this.setState(
            {displayBeforeLeave: false, hasUnsavedData: false},
            () => {
              $('html, body').scrollTop(0);
              this.goToCompanyForm();
            }
          );
        }
      } else if (this.state.planDisplayNameValidation) {
        dispatch({
          type: "personalForm/doRemoveSaveRes",
        });

        this.setState({displayNameValidation: true, hasUnsavedData: false});
      } else if (this.state.planDisplayCardValidation) {
        dispatch({
          type: "personalForm/doRemoveSaveRes",
        });

        this.setState({displayCardValidation: true, hasUnsavedData: false});
      } else if (this.state.isImgSaving) {
        dispatch({
          type: "personalForm/doRemoveSaveRes",
        });
        this.setState({hasUnsavedData: false, isImgSaving: false});
      } else {
        dispatch({
          type: "personalForm/doRemoveSaveRes",
        });

        notification.success({className: "suc", message: "保存成功"});
        this.setState({hasUnsavedData: false});
        if (sessionStorage.afterLogin) {
          history.push(sessionStorage.afterLogin);
          sessionStorage.removeItem("afterLogin");
        }
      }
      this.setState({isBeingSaved: false});
    }
  }
};

export default connect(state => {
  console.log(state.personalForm.data)
  return {
    ...state.personalForm,
    uploadTokenRes: state.global.uploadTokenRes,
  };
})(FlxPersonalForm);