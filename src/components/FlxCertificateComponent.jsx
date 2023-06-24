import React from 'react';
import { connect } from 'dva';
import { history, Link } from 'umi';
import Qiniu from 'react-qiniu-2.0';
import Floader from './Floader.jsx';
import Selector from './Selector.jsx';

class FlxCertificateComponent extends React.Component {
  render() {
    let {data, step} = this.state;
    let disableSubmit = 
      !data.c_name || 
      !data.c_sociology_number ||
      !data.c_certificates_number ||
      !data.c_legal_representative ||
      !data.c_registered_capital ||
      !data.c_date_of_establishment ||
      !data.c_type ||
      !data.start_time ||
      !data.end_time;

        let content;

    if (step < 2) {// === 1
      content = <div>
        {this.renderStep()}
        <div className="fstory">
          <div className="line1">企业认证须知：</div>
          <div className="line2">这是一项身份识别服务，请注意以下几点</div>
          <ol className="line3">
            <li>
              请确保您是具有法人资格的企业，您需提供可证明您依法设
              立、依法经营，开展社会活动的执照、证件等（如营业执照
              副本）。
            </li>
            <li>
              证件有效期在3个月内的企业，请找工商部门更新资料后再
              行提交。
            </li>
            <li>
              根据《中华人民共和国发票管理办法》相关规定：所有单位
              和从事生产、经营活动的个人在购买商品、接受服务以及从
              事其他经营活动支付款项，应当向收款方取得发票。取得发
              票时，不得要求变更与实际经营情况不符的开票信息。因此
              为防止虚开，要求开具企业发票需与实名认证的主体作对应，
              个人实名认证只能开具个人发票。谢谢配合！
            </li>
          </ol>
        </div>
  
        <div className="limit-box bg-f4 moderate-down">
          <button type="button" className="btn2" onClick={this.nextStep.bind(this)}>下一步</button>
        </div>
      </div>
    }

    if (step === 3) {
      let {c_business_license = {}} = this.state;
      let isPdf = c_business_license.type === "application/pdf";
      let isUploading = c_business_license.preview && !c_business_license.key;
      let realImage = !isPdf && (c_business_license.preview || (c_business_license.key && cloud + c_business_license.key));
      content = <div>
        {this.renderStep()}
        <div className="ftext">
          必须为清晰、完整的彩色原件扫描件或数码照<br/>
          仅支持.jpg .bmp .png .gif .pdf的图片格式，图片大小不超过4M<br/>
          必须在有效期内且年检章齐全（当年成立的公司可无年检章）<br/>
          必须为中国大陆工商局颁发
        </div>

        <Qiniu token={this.props.uploadTokenRes || ""} onDrop={this.onDrop.bind(this, "c_business_license")} className="certificate-box" style={{marginLeft: 0, height: "unset", width: "unset"}} multiple={false}>
          <div className="fdocument-upload">
            {!c_business_license.key && (
              <div className="card-tag">营业执照 <span className="orange">PDF</span></div>
            )}
            {c_business_license.key && isPdf && /*uploaded successfully*/ (
              <div className="card-tag center orange"><div>您的营业执照<br/>已上传成功</div></div>
            )}
            <img className={isUploading ? "opacity06" : ""} src={realImage || require("@/img/flx-pdf.png")} alt="PDF" onLoad={() => {$('html').scrollTop(9999)}}/>
            {isUploading && (
              <Floader className="fdocument-spinner"/>
            )}
          </div>
        </Qiniu>

        <div className={"limit-box bg-f4" + (realImage ? " near-down" : " far-down")}>
          <button type="button" className="btn2" onClick={this.submit.bind(this, 2)} disabled={!c_business_license.key}>下一步</button>
        </div>
      </div>
    }

    if (step === 4) {
      let {c_identity_photo_front = {}, c_identity_photo_back = {}} = this.state;
      let realImage1 = c_identity_photo_front.preview || (c_identity_photo_front.key && cloud + c_identity_photo_front.key);
      let realImage2 = c_identity_photo_back.preview || (c_identity_photo_back.key && cloud + c_identity_photo_back.key);
      let isUploadingCard1 = c_identity_photo_front.preview && !c_identity_photo_front.key;
      let isUploadingCard2 = c_identity_photo_back.preview && !c_identity_photo_back.key;

      content = <div>
        {this.renderStep()}
        <div className="ftext">
          请上传法人身份证照片，必须看清证件信息，且证件信息不能被遮挡；<br/>
          仅支持.jpg .bmp .png .gif的图片格式，图片大小不超过4M；<br/>
          您提供的照片我们将予以保护，不会用于其他用途
        </div>

        <Qiniu token={this.props.uploadTokenRes || ""} onDrop={this.onDrop.bind(this, "c_identity_photo_front")} className="id-front-box" style={{marginLeft: 0, height: "unset", width: "unset"}} multiple={false}>
          <div className="fdocument-upload">
            {!c_identity_photo_front.key && (
              <div className="card-tag">法人身份证正面&nbsp;<span className="orange">人像面</span></div>
            )}
            <img className={isUploadingCard1 ? "opacity06" : ""} src={realImage1 || require("@/img/flx-card1.png")} alt="" onLoad={() => {$('html').scrollTop(9999)}}/>
            {isUploadingCard1 && (
              <Floader className="fdocument-spinner"/>
            )}
          </div>
        </Qiniu>

        <Qiniu token={this.props.uploadTokenRes || ""} onDrop={this.onDrop.bind(this, "c_identity_photo_back")} className="id-back-box" style={{marginLeft: 0, height: "unset", width: "unset"}} multiple={false}>
          <div className="fdocument-upload">
            {!c_identity_photo_back.key && (
              <div className="card-tag">法人身份证反面&nbsp;<span className="orange">国徽面</span></div>
            )}
            <img className={isUploadingCard2 ? "opacity06" : ""} src={realImage2 || require("@/img/flx-card2.png")} alt="" onLoad={() => {$('html').scrollTop(9999)}}/>
            {isUploadingCard2 && (
              <Floader className="fdocument-spinner"/>
            )}
          </div>
        </Qiniu>

        <div className="limit-box bg-f4 near-down">
          <button type="button" className="btn2" onClick={this.submit.bind(this, 3)} disabled={!c_identity_photo_front.key || !c_identity_photo_back.key}>下一步</button>
        </div>
      </div>
    }

    if (step === 2) {
      content = <div>
        {this.renderStep()}
        <div className="wide fwide">
          <label className="field">
            <div className="dlabel has-star">公司全称</div>
            <input className="dvalue" type="text" name="c_name" value={data.c_name || ""} onChange={this.handleChange}/>
          </label>

          <label className="field">
            <div className="dlabel has-star">统一社会信用代码</div>
            <input className="dvalue" type="text" name="c_sociology_number" value={data.c_sociology_number || ""} onChange={this.handleChange}/>
          </label>

          <label className="field">
            <div className="dlabel has-star">证件编号</div>
            <input className="dvalue" type="text" name="c_certificates_number" value={data.c_certificates_number || ""} onChange={this.handleChange}/>
          </label>

          <label className="field">
            <div className="dlabel has-star">类型</div>
            <Selector
              name="c_type"
              value={data.c_type || ""}
              options={["有限责任公司", "股份制公司", "集团公司", "一人制公司"]}
              setValue={this.setValue.bind(this)}
              className="dvalue"
              hasNull={true}
            />
            <input className="dvalue" type="text" value={data.c_type || ""} disabled={true}/>
          </label>

          <label className="field">
            <div className="dlabel has-star has-star">法定代表人</div>
            <input className="dvalue" type="text" name="c_legal_representative" value={data.c_legal_representative || ""} onChange={this.handleChange}/>
          </label>

          <label className="field">
            <div className="dlabel has-star">注册资本</div>
            <input className="dvalue" type="text" name="c_registered_capital" value={data.c_registered_capital || ""} onChange={this.handleChange}/>
          </label>

          <label className="field">
            <div className="dlabel has-star">成立日期</div>
            <input className="dvalue" type="date" name="c_date_of_establishment" value={data.c_date_of_establishment || ""} onChange={this.handleChange} placeholder="请选择"/>
          </label>

          <div className="field">
            <div className="dlabel has-star">营业期限</div>
            <div className="dvalue fperiod">
              <input className="start-date" type="date" name="start_time" value={data.start_time || ""} onChange={this.handleChange} placeholder="请选择"/>{" - "}
              <input className="end-date" type="date" name="end_time" value={data.end_time || ""} onChange={this.handleChange} placeholder="请选择"/>
            </div>
          </div>
        </div>

        <div className="limit-box bg-f4 near-down high-bottom">
          <button type="button" className="btn2" onClick={this.submit.bind(this, 1)} disabled={disableSubmit}>确认验证</button>
        </div>
       
      </div>
    }

    if (step === 5) {
      content = <div>
        <div className="transparent-wide">
          <div className="fwait">
            <img src={require("@/img/flx-change.png")} alt=""/>
            <div className="english">wait…</div>
            <div className="chinese">审核中…</div>
          </div>

          <div className="fwait-text">
            您的企业认证信息已上传<br/>
            我们将在3-5个工作日内完成审核，请耐心等待
          </div>
        </div>

        <div className="limit-box">
          {data.c_reviewing == 1 ? (
            <button type="button" className="btn2" onClick={this.props.toggle}>返回</button>
          ) : (
            <button type="button" className="btn2" onClick={this.afterComplete.bind(this)}>定制我的专属标签</button>
          )}
        </div>
      </div>
    }

    return <div className={navigator.platform.slice(0,7)}>
      <div className="sablon"/>
      <div className="header">
        <div className="header-line">
          <div className="h-left back-btn" onClick={step === 1 || data.c_reviewing == 1 ? this.props.toggle : this.previousStep.bind(this)} />

          <div className="h-middle">{step === 2 ? "信息确认" : "企业认证"}</div>

          <Link className="h-home" to="/"/>
        </div>
      </div>
      <div className="space-lines1"/>

      <div className="bg-f4">
        {content}
      </div>
    </div>
  }

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);

    this.state = {data: {c_type: "有限责任公司"}, step: 1, filledStep: 1};
  }

  afterComplete() {
    history.push("/perfect-label");
  }
    
  renderStep() {
    // step: where you are at the moment (the current step you went forward to or back to)
    // filledStep: the highest clickable step at the moment.
    let {step, filledStep} = this.state;
    return <div className="fsteps">
      <div className="on" onClick={this.goToStep.bind(this, 1)}>1</div>
      <span className="on"/>
      
      <span className={step > 1 ? "on" : (filledStep>1?"filled":"")}/>
      <div className={step > 1 ? "on" : (filledStep>1?"filled":"")} onClick={filledStep > 1 ? this.goToStep.bind(this, 2) : null}>2</div>
      <span className={step > 1 ? "on" : (filledStep>1?"filled":"")}/>

      <span className={step > 2 ? "on" : (filledStep>2?"filled":"")}/>
      <div className={step > 2 ? "on" : (filledStep>2?"filled":"")} onClick={filledStep > 2 ? this.goToStep.bind(this, 3) : null}>3</div>
      <span className={step > 2 ? "on" : (filledStep>2?"filled":"")}/>

      <span className={step > 3 ? "on" : (filledStep>3?"filled":"")}/>
      <div className={step > 3 ? "on" : (filledStep>3?"filled":"")} onClick={filledStep > 3 ? this.goToStep.bind(this, 4) : null}>4</div>
    </div>
  }

  nextStep() {
    $('html').scrollTop(0);
    this.setState({step: this.state.step + 1, filledStep: this.state.step + 1});
  }

  goToStep(step) {
    $('html').scrollTop(0);
    this.setState({step});
  }

  previousStep() {
    $('html').scrollTop(0);
    this.setState({step: this.state.step - 1 || 1});
  }

  handleChange(ev) {
    let {data} = this.state;
    data[ev.target.name] = ev.target.value;
    this.setState({data});
  }

  setValue(key, value) {
    let {data} = this.state;
    data[key] = value;
    this.setState({data});
  }

  catchIfError(name, res) {
    let error = res.message || res.body.error;
    if (error) {
      notification.warn({
        message: error === "invalid put policy encoding" ? "您上传的文件类型不符合" : error,
        duration: 0,
      });

      this.setState({
        [name]: {},
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
        className: "erm",
        message: "很抱歉，文件大小不能超过4MB哦~",
        duration: 0,
      });
      return;
    }
    if (name !== "c_business_license" && files[0].type !== "image/jpg" && files[0].type !== "image/jpeg" && files[0].type !== "image/bmp" && files[0].type !== "image/png" && files[0].type !== "image/gif") {
      notification.warn({
        className: "erm",
        message: "您上传的文件类型有误，请上传JPG、BMP、GIF、PNG格式的文件~",
        duration: 0,
      });
      return;
    }
    if (name === "c_business_license" && files[0].type !== "image/jpg" && files[0].type !== "image/jpeg" && files[0].type !== "image/bmp" && files[0].type !== "image/png" && files[0].type !== "image/gif" && files[0].type !== "application/pdf") {
      notification.warn({
        className: "erm",
        message: "您上传的文件类型有误，请上传JPG、BMP、GIF、PNG、PDF格式的文件~",
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

  submit(type) {
    const { dispatch } = this.props;
    let data = {};
    if (type == 1) {//step 2
      data = $.extend({}, this.state.data);
      data.c_business_term = data.start_time + " - " + data.end_time;
      delete data.start_time;
      delete data.end_time;
    } else if (type == 2) {
      data.c_business_license = this.state.c_business_license.key;
    } else if (type == 3) {
      data.c_identity_photo_front = this.state.c_identity_photo_front.key;
      data.c_identity_photo_back = this.state.c_identity_photo_back.key;
    }
    data.type = type;

    dispatch({
      type: "companyForm/save",
      payload: data,
    });
  }

  componentDidMount() {
    $('html').scrollTop(0);
    const { dispatch } = this.props;
    let {data} = this.props;
    
    if (!this.props.uploadTokenRes) {
      dispatch({
        type: "global/getUploadToken",
      });
    }
    if (data) {
      data.c_type = data.c_type || "有限责任公司";
      this.setState({data, step: data.c_reviewing == 1 ? 5 : 1});
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.saveRes && !this.props.saveRes) {
      const { dispatch } = this.props;
      dispatch({
        type: "companyForm/doRemoveSaveRes",
      });
      this.nextStep();
    }
  }
}  

export default FlxCertificateComponent = connect(state => {
  let {data, saveRes} = state.companyForm;
  return {
    data,
    saveRes,
    uploadTokenRes: state.global.uploadTokenRes,
  };
})(FlxCertificateComponent);