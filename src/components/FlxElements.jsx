import React from 'react';
import { connect } from 'dva';
import { notification } from 'antd';
import { Link } from 'umi';
import FlxErrorPopup from '@/components/FlxErrorPopup.jsx';
import IosSelectCity from '@/components/IosSelectCity.jsx';
import Radio from '@/components/Radio.jsx';
import Floader from '@/components/Floader.jsx';
import Qiniu from 'react-qiniu-2.0';
import moment from 'moment';
import {
  hasVal,
  isIOS,
  toTwoDec,
} from '@/utils/utils';

/* MOBILE (/ General) */
export class TwoOptionsWithObj extends React.Component {
  constructor(props) {
    super(props);

    this.state = {value: this.props.value};
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({value: nextProps.value});
  }

  onSelect(value) {
    this.setState({value: value});
    this.props.setValue(this.props.name, value);
  }

  render() {
    if (this.props.disabled) {
      return <span className="pseudo-input">{this.state.value}</span>
    } else {
      return <div className={"two-options " + (this.props.className || "")}>
        <button type="button" name={this.props.options[0].key} onClick={this.onSelect.bind(this, this.props.options[0].key)} className="button-cucumber" disabled={this.state.value === this.props.options[0].key} >{this.props.options[0].value}</button>
        <button type="button" name={this.props.options[1].key} onClick={this.onSelect.bind(this, this.props.options[1].key)} className="button-cucumber" disabled={this.state.value === this.props.options[1].key} >{this.props.options[1].value}</button>
      </div>
    }
  }
}

class NameValidation_Class extends React.Component {
  render() {
    let {linkToCopy} = this.state;

    return <div className={navigator.platform.slice(0,7)}>
      <div className="header">
        <div className="header-line">
          <div className="h-left back-btn" onClick={this.props.toggle} />

          <div className="h-middle">认证提醒</div>

          <Link className="h-home" to="/"/>
        </div>
      </div>
      <div className="space-lines1"/>

      <div className="dcopy-banner"/>

      <div>
        <div className="dcopy1">请复制以下链接在浏览器中打开：</div>
        <div className="dcopy2">{linkToCopy}</div>
        <div className="dcopy3">
          Step 1:
          <div className="btn2" onClick={this.copyToClipboard.bind(this, linkToCopy)}>复制链接</div>
        </div>
        <div className="dcopy3">
          Step 2:
          <div className="btn2" onClick={this.goToCardValidation.bind(this)}>已完成认证,下一步</div>
        </div>
        {/*<div className="dcopy4">
          <div className="dcopy5">认证完成后请关闭或返回上一页</div>
          <div className="porange float-right" onClick={this.props.toggle}>
            返回信息页
            <div className="forward-btn"/>
          </div>
        </div>*/}
      </div>
    </div>
  }

  constructor() {
    super();
    this.state = {};
  }

  goToCardValidation() {
    this.props.toggle();
    this.props.toggleCardValidation();
  }

  copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);
    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            notification.warn({
              message: "无法复制",
              duration: 0,
            });
            this.hasError = true;
            return false;
        }
        finally {
          document.body.removeChild(textarea);
          if (!this.hasError) {
            this.hasError = false;
            notification.success({className: "suc", message: "复制成功"});
          }
        }
    }
  }

  certify(cert_name, cert_no) {
    const { dispatch } = this.props;
    dispatch({
      type: "personalForm/certify",
      payload: {cert_name, cert_no},
    });
  }

  getInfo() {
    const { dispatch } = this.props;
    dispatch({
      type: "personalForm/getInfo",
    });
  }

  componentDidMount() {
    $('html').scrollTop(0);
    let {cert_name, cert_no, certifyRes} = this.props;
    if (certifyRes) {
      this.setState({linkToCopy: certifyRes.data});
    } else if (cert_no) {
      this.certify(cert_name, cert_no);
    } else {
      this.getInfo();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.cert_no && !this.props.cert_no) {
      this.certify(nextProps.cert_name, nextProps.cert_no);
    }

    if (nextProps.certifyRes && !this.props.certifyRes) {
      this.setState({linkToCopy: nextProps.certifyRes.data});
      const { dispatch } = this.props;
      dispatch({
        type: "personalForm/doRemoveCertifyRes",
      });
    }
  }
}

export const NameValidation = connect(state => {
  let {data, certifyRes} = state.personalForm;
  return {
    cert_name: data.member_name,
    cert_no: data.member_identity,
    certifyRes,
  };
})(NameValidation_Class);
/**/

class CardValidation_Class extends React.Component {
  render() {
    let {step, data = {}} = this.state;
    let {uploadTokenRes} = this.props;

    if (step === 0) {
      let {member_bank_photo_front = {}, member_bank_photo_back = {}} = this.state;
      let realImage1 = member_bank_photo_front.preview || (member_bank_photo_front.key && cloud + member_bank_photo_front.key);
      let realImage2 = member_bank_photo_back.preview || (member_bank_photo_back.key && cloud + member_bank_photo_back.key);
      let isUploadingCard1 = member_bank_photo_front.preview && !member_bank_photo_front.key;
      let isUploadingCard2 = member_bank_photo_back.preview && !member_bank_photo_back.key;

      return <div className={navigator.platform.slice(0,7)}>
        <div className="header">
          <div className="header-line">
            <div className="h-left back-btn" onClick={this.props.toggle} />

            <div className="h-middle">银行卡信息</div>

            <Link className="h-home" to="/"/>
          </div>
        </div>
        <div className="space-lines1"/>

        <div className="bg-f4">
          <div className="ftext">
            请上传本人银行卡照片，必须看清银行卡信息，且信息不能被遮挡；<br/>
            仅支持.jpg .bmp .png .gif的图片格式，图片大小不超过4M；<br/>
            您提供的照片我们将予以保护，不会用于其他用途
          </div>

          <Qiniu token={uploadTokenRes || ""} onDrop={this.onDrop.bind(this, "member_bank_photo_front")} className="id-front-box" style={{marginLeft: 0, height: "unset", width: "unset"}} multiple={false}>
            <div className="fdocument-upload">
              {!member_bank_photo_front.key && (
                <div className="card-tag">银行卡&nbsp;<span className="orange">正面</span></div>
              )}
              <img className={isUploadingCard1 ? "opacity06" : ""} src={realImage1 || require("@/img/flx-card4.png")} alt="" onLoad={() => {$('html').scrollTop(9999)}}/>
              {isUploadingCard1 && (
                <Floader className="fdocument-spinner"/>
              )}
            </div>
          </Qiniu>

          <Qiniu token={uploadTokenRes || ""} onDrop={this.onDrop.bind(this, "member_bank_photo_back")} className="id-back-box" style={{marginLeft: 0, height: "unset", width: "unset"}} multiple={false}>
            <div className="fdocument-upload">
              {!member_bank_photo_back.key && (
                <div className="card-tag">银行卡&nbsp;<span className="orange">反面</span></div>
              )}
              <img className={isUploadingCard2 ? "opacity06" : ""} src={realImage2 || require("@/img/flx-card3.png")} alt="" onLoad={() => {$('html').scrollTop(9999)}}/>
              {isUploadingCard2 && (
                <Floader className="fdocument-spinner"/>
              )}
            </div>
          </Qiniu>

          <div className="center orange near-down" onClick={this.goToStep.bind(this, 1)}>跳过此步骤</div>

          <div className="limit-box bg-f4 near-down">
            <button type="button" className="btn2" onClick={this.savePersonalInfo.bind(this)} disabled={!member_bank_photo_front.key || !member_bank_photo_back.key}>下一步</button>
          </div>
        </div> 
      </div>
    }

    if (step === 1) {
      let canSubmit = 
        data.member_opening_bank &&
        data.member_opening_name &&
        data.member_subbranch &&
        data.member_bank_account &&
        data.member_bank_account.length > 0 &&
        data.member_bank_account.length <= 20;

      return <div className={navigator.platform.slice(0,7)}>
        <div className="header">
          <div className="header-line">
            <div className="h-left back-btn" onClick={this.goToStep.bind(this, 0)}/>

            <div className="h-middle">信息确认</div>

            <Link className="h-home" to="/"/>
          </div>
        </div>
        <div className="space-lines1"/>

        <div className="bg-f4">
          <div className="wide fwide">
            <label className="field">
              <div className="dlabel has-star">开户银行</div>
              <input className="dvalue" type="text" name="member_opening_bank" value={data.member_opening_bank || ""} onChange={this.handleChange}/>
            </label>
            <label className="field">
              <div className="dlabel has-star">开户名</div>
              <input className="dvalue" type="text" name="member_opening_name" value={data.member_opening_name || ""} onChange={this.handleChange}/>
            </label>
            <label className="field">
              <div className="dlabel has-star">支行</div>
              <input className="dvalue" type="text" name="member_subbranch" value={data.member_subbranch || ""} onChange={this.handleChange}/>
            </label>
            <label className="field">
              <div className="dlabel has-star">银行账号</div>
              <input className="dvalue" type="number" name="member_bank_account" value={data.member_bank_account || ""} onChange={this.handleChange}/>
            </label>
          </div>

          <div className="limit-box bg-f4 near-down">
            <button type="button" className="btn2" onClick={this.submitBankInfo.bind(this)} disabled={!canSubmit}>确认验证</button>
          </div>
        </div>
      </div>
    }
  }

  constructor(props) {
    super();
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      step: 0,
      member_bank_photo_front: {key: props.member_bank_photo_front},
      member_bank_photo_back: {key: props.member_bank_photo_back},
    }
  }

  handleChange(ev) {
    let {data} = this.state;
    data[ev.target.name] = ev.target.value;
    this.setState({data});
  }

  goToStep(step) {
    if (step == 1) {
      this.getData();
    }
    this.setState({step: step});
  }

  catchIfError(name, res) {
    let error = res.message || res.body.error;
    if (error) {
      notification.warn({
        message: error === "invalid put policy encoding" ? "您上传的文件类型不符合" : error,
        duration: 0,
      });

      this.setState({
        [name]: {}, // ..._front or _back
      });
    }
  }

  onDrop(name, files) {
    /* isUploading: Show spinner
     * hasImage: Show image
     * false && false: Show "+"
     */
    if (files[0].size > 4194304) {
      notification.warn({
        message: "很抱歉，文件大小不能超过4MB哦",
        duration: 0,
      });
      return;
    }
    if (files[0].type !== "image/jpg" && files[0].type !== "image/jpeg" && files[0].type !== "image/bmp" && files[0].type !== "image/png" && files[0].type !== "image/gif") {
      notification.warn({
        message: "您上传的文件类型有误，请上传JPG、BMP、GIF、PNG格式的文件",
        duration: 0,
      });
      return;
    }
    // add the new file to state
    this.setState({[name]: files[0]});

    // when upload response will come, add the file location to the existing files in state. The variable i is in the bind and it is taking care which key belongs to which file.
    files[0].uploadPromise.then(res => {
      if (res.body.error) {
        this.catchIfError(name, res);
        return;
      }
      let file = this.state[name];
      file.key = res.body.name && res.body.name.key || res.body.key;// API goes through changes, sometimes has k: or n:{k:}
      // if (file.key.indexOf(".pdf") !== -1) {
      //   preview = cloud + file.key;
      // }
      this.setState({[name]: file});
    })
    .catch(this.catchIfError.bind(this, name));

    // files is a FileList(https://developer.mozilla.org/en/docs/Web/API/FileList) Object
    // and with each file, we attached two functions to handle upload progress and result
    // file.request => return super-agent uploading file request
    // file.uploadPromise => return a Promise to handle uploading status(what you can do when upload failed)
    // `react-qiniu` using bluebird, check bluebird API https://github.com/petkaantonov/bluebird/blob/master/API.md
    // see more example in:
    // https://github.com/lingochamp/react-qiniu/blob/master/example/app.js
  }

  getData() {
    const { dispatch } = this.props;
    dispatch({
      type: "personalForm/getInfo",
    });
  }

  savePersonalInfo() {
    const { dispatch } = this.props;
    let data = {};
    data.member_bank_photo_front = this.state.member_bank_photo_front.key;
    data.member_bank_photo_back = this.state.member_bank_photo_back.key;

    dispatch({
      type: "personalForm/submitBankInfo",
      payload: data,
    });
  }

  submitBankInfo() {
    const { dispatch } = this.props;
    let {data} = this.state;
    let query = {
      member_opening_bank: data.member_opening_bank,
      member_name: data.member_name,
      member_opening_name: data.member_opening_name,
      member_subbranch: data.member_subbranch,
      member_bank_account: data.member_bank_account,
    }

    dispatch({
      type: "personalForm/submitBankInfo",
      payload: query,
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let {dispatch} = this.props;
    
    if (nextProps.data && !this.state.data) {
      let {data = {}} = nextProps;
      this.setState({data});
    }

    if (nextProps.submitBankInfoRes && !this.props.submitBankInfoRes) {
      dispatch({
        type: "personalForm/doRemoveSubmitBankInfoRes",
      });
      if (this.state.step === 0) {
        this.goToStep(1);
      } else {
        dispatch({
          type: "personalForm/reloadData",
        });
        this.props.toggle();
      }
    }
  }
};

export const CardValidation = connect(state => {
  return {
    ...state.personalForm,
    uploadTokenRes: state.global.uploadTokenRes,
  };
})(CardValidation_Class);
/**/

export class Address extends React.Component {
  render() {
    let {data} = this.state;
    let {title} = this.props;

    return <div className={"bg-f4 " + (navigator.platform.slice(0,7))}>
      
      <div className="header">
        <div className="header-line">
          <div className="h-left back-btn" onClick={this.props.toggle} />

          <div className="h-middle">{title}</div>

          <Link className="h-home" to="/"/>
        </div>
      </div>
      <div className="space-lines1"/>

      <div className="wide bg-f4 eline1">
        请正确录入您的{title}，方便更好的接单服务。
      </div>

      <div className="wide bg-white">
        <label className="field">
          <div className="dlabel">{title}</div>
          <IosSelectCity value={data.cityDistrict} applySelection={this.setValue.bind(this, "cityDistrict")} className="dvalue"/>
          {isIOS && <div className="go "/>}
        </label>

        <label className="field">
          <div className="dlabel">详细地址</div>
          <input className="dvalue" type="text" name="streetNumber" value={data.streetNumber || ""} onChange={this.handleChange.bind(this)}/>
        </label>
      </div>

      <div className="limit-box far-down">
        <button type="button" className="btn2 btn-high" onClick={this.submit.bind(this)} >确认提交</button>
      </div>
    </div>
  }

  constructor(props) {
    super(props);

    this.state = {data: {
      cityDistrict: props.cityDistrict,
      streetNumber: props.streetNumber,
    }};
  }

  setValue(name, value) {
    let {data} = this.state;
    data[name] = value;
    this.setState({data});
  }

  handleChange(ev) {
    let {data} = this.state;
    data[ev.target.name] = ev.target.value;
    this.setState({data});
  }

  submit() {
    this.props.setAddress(this.state.data.cityDistrict, this.state.data.streetNumber);
    this.props.toggle();
  }
}

export class CancelOrder extends React.Component {
  render() {
    return <div className="popup cancel-order-popup">
      <div className="cancel-order">
        <div className="line1">取消订单</div>
        <div className="line2">请选择取消订单的理由</div>
        <Radio
          mainClass=""
          optionClass="cancel-radio"
          type="radio7"
          name="type"
          value={this.state.reason}
          handleRadio={this.handleRadio.bind(this)}
          options={[
            "暂时不要了。",/*is set default in constructor*/
            "双方协商取消。",
            "内容有误，重新下单。",
          ]}
        />

        <div className="operations">
          <div className="cancel" onClick={this.props.toggleCancel}>暂不取消</div>
          <div className="ok" onClick={this.props.sendCancel.bind(null, this.state.reason)}>确认取消</div>
        </div>
      </div>
    </div>
  }

  constructor() {
    super();

    this.state = {reason: "暂时不要了。"};
  }

  handleRadio(ev) {
    this.setState({reason: ev.target.value});
  }

}

export class Menu extends React.Component {
  render() {
    let {details} = this.state;
    let unread = this.state.unread || this.props.unread;
    details = details || this.props.details || {};
    let defaultHeadImg = require("@/img/flx7.png");

    return <div>
      
      <div id="fog" className="fog" onClick={this.toggleMenu.bind(this, false)}/>

      <div className="menu">
        <Link className="menu-top" to={sessionStorage.logintoken ? "/my-page" : "/login"}>
          <div className="img">
            {hasVal(details.member_profile) && (
              <img src={cloud + details.member_profile} onError={(ev) => {ev.target.src = defaultHeadImg}}/>
            )}
            {!sessionStorage.logintoken && (
              <img src={defaultHeadImg}/>
            )}
          </div>
          {sessionStorage.logintoken ? (
            <div>
              <div className="company">{details.c_name}</div>
              <div className="name">{details.member_nickname}</div>
              {details.member_introduction && <div className="motto"><div>{details.member_introduction}</div></div>}
            </div>
          ) : (
            <div className="company">注册/登录</div>
          )}
        </Link>

        <div className="menu-home menu-inner">
          <Link to="/">
            <div className="index"/>
            首页
          </Link>
        </div>
        {!sessionStorage.logintoken ? <div className="menu-list menu-inner"/>
        : <div className="menu-list menu-inner">
          <Link to="/chat-list">
            <div className="chat-list"/>
            消息通知
            {!!+unread && <span className="unread-count">{unread}</span>}
          </Link>
          <Link to="/collection">
            <div className="collection"/>
            我的收藏
          </Link>
          <Link to="/demand-create">
            <div className="demand-create"/>
            发布需求
          </Link>
          <Link to="/service-create">
            <div className="service-create"/>
            发布服务
          </Link>
          <Link to="/choose-role">
            <div className="switch-role"/>
            角色切换
          </Link>
        </div>}
        
        <div className="menu-inner for-logout">
          {sessionStorage.logintoken && <div onClick={this.props.logout}>
            <div className="logout"/>
            账号登出
          </div>}
        </div>
      </div>
    </div>
  }

  constructor() {
    super();

    this.state = {};
  }

  toggleMenu(shouldOpen) {
    if (!shouldOpen) {
      /* hide menu. Set back the previous scrollTop value instead of marginTop. 
       * fog (white overlay) opacity is changed if it has a display-menu class parent; it has that when menu is opened.
       * fog zIndex need delay to go behind only after opacity animation ends*/  
      this.props.setMenu(false);
      $('body').removeClass("fixed-body");
      window.setTimeout(() => {
        $('#fog').css({zIndex: -1});
        $('#entire').css({height: "auto"});
        $('body').css({marginTop: 0});
        $(window).scrollTop(this.scrolled);
      }, 200);
    } else {
      this.scrolled = $(window).scrollTop() || 0;
      $('body').addClass("fixed-body").css({marginTop: - this.scrolled});
      $('#entire').css({height: $(document).innerHeight()});
      $('#fog').css({zIndex: 30});
      this.props.setMenu(true);
    }
  }

  componentWillUnmount() {
    $('body').removeClass("fixed-body");
  }
}

export class Money_Class extends React.Component {
  render() {
    let {balance, money} = this.state;

    return <div>
      <div className="header">
        <div className="header-line">
          <div className="h-left back-btn" onClick={this.props.toggle} />

          <div className="h-middle">提现</div>

          <Link className="h-home" to="/"/>
        </div>
      </div>
      <div className="space-lines1"/>

      <div className="bg-f4">
        <img className="money-banner" src={require("@/img/flx3.png")} alt=""/>

        <div className="u1-1">￥ {toTwoDec(balance)}</div>
        <div className="u1-2">可提现</div>
  
        <div className="eggwhite">
          <div className="u1-3">提现到银行卡</div>
          <div className="u1-4">
            <span className="bold">￥</span>
            <input type="number" value={money || ""} min={0} max={balance} onChange={this.handleChange.bind(this)}/>
            <div className="all" onClick={this.setAll.bind(this)}>全部</div>
          </div>
          <div className="yolk">平台每月结算一次，当月最后一天24:00前申请提现的金额将于次月5日前到账。</div>
        </div>
      </div>

      <div className="limit-box near-down">
        <button type="button" className="btn2" onClick={this.saveWithdrawal.bind(this)}>立即提现</button>
      </div>
    </div>
  }

  constructor() {
    super();

    this.state = {};
  }
  
  setAll() {
    let {balance} = this.state;
    this.setState({money: balance});
  }

  handleChange(ev) {
    this.setState({money: ev.target.value});
  }

  getBalance() {
    const { dispatch } = this.props;
    dispatch({
      type: "myPage/getBalance",
    });
  }

  saveWithdrawal() {
    const { dispatch } = this.props;
    dispatch({
      type: "myPage/saveWithdrawal",
      payload: {money: this.state.money},
    });
  }

  componentDidMount() {
    $('html').scrollTop(0);
    this.getBalance();
    $('html').addClass("bg-f4");
  }

  componentWillUnmount() {
    $('html').removeClass("bg-f4");
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;
  
    if (nextProps.balance && !this.props.balance) {
      this.setState({balance: nextProps.balance, money: nextProps.balance});
      dispatch({
        type: "myPage/doRemoveBalance",
      });
    }

    if (nextProps.saveWithdrawalRes && !this.props.saveWithdrawalRes) {
      this.props.afterSave();
      dispatch({
        type: "myPage/doRemoveSaveWithdrawalRes",
      });
    }
  }
}

export const Money = connect(state => {
  let {balance, saveWithdrawalRes} = state.myPage;
  return {
    balance,
    saveWithdrawalRes,
  };
})(Money_Class);
/**/


export class MonthMoney_Class extends React.Component {
  render() {
    let {info = {}, date, isLoading} = this.state;

    return <div>
      {isLoading && <Floader className="full-page"/>}

      
      <div className="header">
        <div className="header-line">
          <div className="h-left back-btn" onClick={this.props.toggle} />

          <div className="h-middle">月收益</div>

          <Link className="h-home" to="/"/>
        </div>
      </div>
      <div className="space-lines1"/>

      <img className="month-money-banner" src={require("@/img/flx6.png")} alt=""/>
      
      <div className="report">
        <div className="title">
          单月总收支明细
          <input type="month" className="month" onChange={this.changeDate.bind(this)} value={date}/>
        </div>

        <div className="small-margin">
          <div className="half">
            <span>订单总金额 /</span>
            <div className="qyolk"> ￥{toTwoDec(info.all_money)}</div>
          </div>
          <div className="half">
            <span>手续费 /</span>
            <div className="qyolk"> ￥{toTwoDec(info.service_fee)}</div>
          </div>
          <div className="half">
            <span>结算服务费 /</span>
            <div className="qyolk"> ￥{toTwoDec(info.get_money)}</div>
          </div>
        </div>
      </div>

      <div className="report">
        <div className="title">
          <span>单月收支明细</span>
        </div>
        
        <table className="small-margin">
          <thead>
            <tr>
              <th style={{width: "13%"}}>日期</th>
              <th style={{width: "22%"}}>订单金额</th>
              <th style={{width: "27%"}}>平台手续费</th>
              <th>结算服务费</th>
            </tr>
          </thead>
          <tbody>
            {info.data && info.data.map(this.eachTransaction.bind(this))}
          </tbody>
        </table>
      </div>
    </div>
  }

  constructor() {
    super();

    this.state = {date: moment().format("YYYY-MM")};
  }

  eachTransaction(item, i) {
    return <tr key={i}>
      <td className="transaction-date">{item.wallet_create_time}</td>
      <td>￥{item.wallet_all_money}</td>
      <td>￥{item.wallet_service_fee}</td>
      <td>￥{item.wallet_get_money}</td>
    </tr>
  }

  changeDate(ev) {
    this.setState({isLoading: true, date: ev.target.value}, this.getWalletInfo);
  }

  getWalletInfo() {
    let {date} = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: "myPage/getWalletInfo",
      payload: {date},
    });
  }
  // getWalletInfo() {
  //   let {date} = this.state;

  //   myPost({
  //     url: flxUrl + "/Wallet/getWalletInfo",
  //     dataType: "json",
  //     data: {date},
  //     success: res => {
  //       if (res.code === 1) {
  //         this.setState({isLoading: false, info: res.data});
  //       } else {
  //         this.setState({isLoading: false, errorMsg: res.msg});
  //       }
  //     },
  //     error: (x, s, e) => {
  //       this.setState({isLoading: false, errorMsg: e});
  //     }
  //   });
  // }

  componentDidMount() {
    $('html').scrollTop(0);
    this.getWalletInfo();
    $('html').addClass("bg-f4");
  }  

  componentWillUnmount() {
    $('html').removeClass("bg-f4");
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;
  
    if (nextProps.walletInfo && !this.props.walletInfo) {
      if (nextProps.walletInfo.code === 1) {
        this.setState({isLoading: false, info: nextProps.walletInfo.data});
      } else {
        this.setState({isLoading: false});
      }
      dispatch({
        type: "myPage/doRemoveWalletInfo",
      });
    }
  }
}

export const MonthMoney = connect(state => {
  let {walletInfo} = state.myPage;
  return {
    walletInfo,
  };
})(MonthMoney_Class);
/**/


export class Rating extends React.Component {
  render() {
    let {value} = this.props;
    return <div className="rating-stars">
      <div className={"favi" + (value > 0 ? " collect" : "")} onClick={this.props.setRating} data-value={1}/>
      <div className={"favi" + (value > 1 ? " collect" : "")} onClick={this.props.setRating} data-value={2}/>
      <div className={"favi" + (value > 2 ? " collect" : "")} onClick={this.props.setRating} data-value={3}/>
      <div className={"favi" + (value > 3 ? " collect" : "")} onClick={this.props.setRating} data-value={4}/>
      <div className={"favi" + (value > 4 ? " collect" : "")} onClick={this.props.setRating} data-value={5}/>
    </div>
  }
}

export class SmallRating extends React.Component {
  render() {
    let {value} = this.props;
    return <div className="rating-stars-s">
      <div className={"fav-s" + (value > 0 ? " collect" : "")}/>
      <div className={"fav-s" + (value > 1 ? (value == 1.5 ? " half" : " collect") : "")}/>
      <div className={"fav-s" + (value > 2 ? (value == 2.5 ? " half" : " collect") : "")}/>
      <div className={"fav-s" + (value > 3 ? (value == 3.5 ? " half" : " collect") : "")}/>
      <div className={"fav-s" + (value > 4 ? (value == 4.5 ? " half" : " collect") : "")}/>
    </div>
  }
}

// exports are:
// TwoOptionsWithObj
// NameValidation
// CardValidation
// Address
// CancelOrder
// Menu
// Money
// MonthMoney
// Rating
// SmallRating