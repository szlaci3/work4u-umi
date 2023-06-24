import PageParent from '@/components/PageParent.jsx';
import { connect } from 'dva';
import { history } from 'umi';
import { notification } from 'antd';
import Checkbox from '@/components/Checkbox.jsx';
import Floader from '@/components/Floader.jsx';
import {
  hasVal,
  isIOS,
  toArrayIfPossible,
  sanitizedContent,
  formatDate0000,
} from '@/utils/utils';

// direction: job - means Edit a job. Must have id. In case of create job we dont have direction.

/// create, edit
// once unpublished and the first field change is saved, the id will change.
// isFirstSave shows loader while no-id changes to id, or existing id changes.
// isFirstSave always true when submitIsLoading is true, makes sense if we dont save 1by1, keep for possible removal of 1by1
// saved_sdl_count We keep this value, each in-line-save doesnt give the right sdl_count.
class FlxJobCreateComponent extends PageParent {
  render() {

    let {data = {}, saved_sdl_count, hasUnsavedData, industries = [], isDepositOn, sd_days, isFirstSave, submitIsLoading} = this.state;
    let areMustValuesMissing = 
      !data.sd_type ||
      !data.sd_position ||
      !data.sd_con ||
      !data.sd_age_min ||
      !data.sd_age_max ||
      !hasVal(data.sd_qualifications) ||
      !hasVal(data.sd_certificates) ||
      !hasVal(data.sd_enrol_type) ||
      data.sd_enrol_type == 1 && !data.sd_deadline
      ;

    let price = 50;
    let total = sd_days * price * (saved_sdl_count || 0);

    return <div>
      
      <div className="form">
        {(isFirstSave || industries.length === 0 || submitIsLoading) && <Floader className="full-page"/>}

        <label className="field">
          <div className="dlabel">主题分类</div>
          <select className={"dvalue" + (data.sd_type ? "" : " placeholder-color")} name="sd_type" onChange={this.handleSelectChange} value={data.sd_type} defaultValue="">
            <option value="" hidden disabled>请选择</option>
            {industries.map(this.eachOption.bind(this))}
          </select>
          {isIOS && <div className="go "/>}
        </label>
        
        <div className="field">
          <div className="dlabel">岗位</div>
          <input className="dvalue" type="text" name="sd_position" value={data.sd_position || ""} onChange={this.handleChangePosition.bind(this)} onKeyUp={this.handleKeyUp} placeholder="Please fill in"/>
        </div>

        <label className="field">
          <div className="dlabel">详细描述</div>
          <div className="dcount">{(data.sd_con ? data.sd_con.length : 0) + " / 200"}</div>
          <div className="dvalue full">
            <div className="goals-wrapper">
              <textarea id="goals" className="goals" name="sd_con" value={this.htmlDecode(data.sd_con)} onChange={this.handleGoalsChange.bind(this)} onKeyUp={this.handleGoalsKeyUp.bind(this)} placeholder="未添加"/>
              <div id="goalsdiv" className="goals" dangerouslySetInnerHTML={sanitizedContent(data.sd_con)} />
            </div>
          </div>
        </label>

        <label className="field">
          <div className="dlabel">年龄区间</div>
          <div className="dvalue halves age">
            <input className="interval" type="number" step="1" min={14} max={100} name="sd_age_min" value={+data.sd_age_min || ""} onChange={this.handleChange} onKeyUp={this.handleKeyUp}/> ~ <input className="interval" type="number" step="1" min={data.sd_age_min || 14} max={100} name="sd_age_max" value={+data.sd_age_max || ""} onChange={this.handleChange} onKeyUp={this.handleKeyUp}/>
          </div>
        </label>

        <label className="field">
          <div className="dlabel">学历要求</div>
          <select className={"dvalue" + (hasVal(data.sd_qualifications) ? "" : " placeholder-color")} name="sd_qualifications" onChange={this.handleSelectChange} value={data.sd_qualifications} defaultValue="">
            <option value="" hidden disabled>请选择</option>
            {this.qualifications.map(this.eachOptionIndexed.bind(this))}
          </select>
          {isIOS && <div className="go "/>}
        </label>

        <label className="field">
          <div className="dlabel">需要证件类型</div>
          <select className={"dvalue" + (hasVal(data.sd_certificates) && data.sd_certificates !== "" ? "" : " placeholder-color")} name="sd_certificates" onChange={this.handleSelectChange} value={data.sd_certificates} defaultValue="">
            <option value="" hidden disabled>请选择</option>
            <option value={0}>无</option>
            <option value="健康证">健康证</option>
          </select>
          {isIOS && <div className="go "/>}
        </label>

        <div className="field">
          <div className="dlabel">报名方式设置</div>
          <select className={"dvalue" + (hasVal(data.sd_enrol_type) ? "" : " placeholder-color")} name="sd_enrol_type" onChange={this.handleSelectEnrolType.bind(this)} value={data.sd_enrol_type} defaultValue="">
            <option value="" hidden disabled>请选择</option>
            <option value={0}>报满截至</option>
            <option value={1}>到期截至</option>
          </select>
          {isIOS && <div className="go "/>}
        </div>

        {data.sd_enrol_type == 1 && (
          <div className="field">
            <div className="dlabel">截止时间</div>
            <input className="dvalue" type="date" name="sd_deadline" value={data.sd_deadline || ""} onChange={this.handleSelectChange} min={formatDate0000(new Date())}/>
            {isIOS && <div className="go "/>}
          </div>
        )}


        <label className="field" onClick={(this.props.terms && !areMustValuesMissing) ? this.goToAddresses.bind(this) : null}>
          <div className="dlabel">需求列表（可同时添加多个地址）</div>
          <div className={"dvalue" + (+saved_sdl_count ? "" : " placeholder-color")}>{+saved_sdl_count ? "已添加" : "未添加"}</div>
          {this.props.terms && !areMustValuesMissing && <div className="go "/>}
        </label>

        <div className="field">
          <div className="dlabel">需求设置（每有一条岗位需求，收取50元/条）</div>
          <div className="dvalue w100">
            需求置顶
            <div className={"toggle" + (isDepositOn ? "" : " off")} onClick={this.toggleDeposit.bind(this)}/>
          </div>
        </div>

        {isDepositOn && (
          <div>
            <div className="field">
              <div className="dlabel">置顶时间设置</div>
              <div className="dvalue w100">
                置顶天数
                <div className="dquantity-buttons">
                  <button className="dminus" onClick={this.minus.bind(this)} disabled={sd_days == 1}>-</button>
                  <button className="dquantity">{sd_days}</button>
                  <button className="dplus" onClick={this.plus.bind(this)} disabled={sd_days == this.days_max}>+</button>
                </div>
              </div>
            </div>

            <div className="field">
              <div className="dlabel">置顶费用</div>
              <div className="dvalue w100">
                需支付押金
                <div className="dtotal">
                  ￥{total}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="terms m-user-agreement">
          <Checkbox
            type="checkbox"
            name="terms"
            checked={this.props.terms}
            handleChange={this.props.handleTermsChange}
            label={<div>我已阅读并同意《<a onClick={this.props.toggleTerms} >珺才人力灵活用工平台用户使用规则</a>》</div>}
          />
        </div>

        <div className="dbuttons near-down">
          <button type="button" className="dsubmit" onClick={this.saveSiteDemand.bind(this, 1, false)} disabled={!this.props.terms || areMustValuesMissing || !+saved_sdl_count}>
            立即发布
          </button>
          <button type="button" className="ddraft" onClick={this.saveSiteDemand.bind(this, 0, false)} disabled={!this.props.terms}>
            保存
          </button>
        </div>

        <div className="gdecor">
          <div className="gdecor1"/>
          <div>
            资金担保
          </div>
          <div className="gdecor2"/>
          <div>
            实名认证
          </div>
          <div className="gdecor3"/>
          <div>
            官方介入
          </div>
        </div>
      </div>
    </div> 
  }

  constructor(props) {
    super(props);
    this.hash = props.match.params;

    this.handleChange = this.handleChange.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);

    this.days_max = 1000;
    this.qualifications = [
      '无',
      '小学',
      '初中',
      '中专',
      '高中',
      '大专',
      '本科',
      '硕士',
      '博士',
      '博士后'
    ];

    this.state = {data: {}, sd_days: 1};
  }

  minus() {
    this.setState({sd_days: Math.max(1, this.state.sd_days - 1)});
  }

  plus() {
    this.setState({sd_days: Math.min(this.days_max, Number(this.state.sd_days) + 1)});
  }

  toggleDeposit() {
    this.setState({isDepositOn: !this.state.isDepositOn});
  }

  eachOption(option, i) {
    return <option key={i} value={option}>
      {option}
    </option>
  }

  eachOptionIndexed(option, i) {
    return <option key={i} value={i}>
      {option}
    </option>
  }

  eachUser(user, i) {
    return <option key={i} value={user.d_user_type}>
      {user.name}
    </option>
  }

  handleChange(ev) {
    let {data} = this.state;
    data[ev.target.name] = ev.target.value;
    this.setState({data, hasUnsavedData: true});
  }

  handleChangePosition(ev) {
    if (ev.target.value.length <= 20) {
      this.handleChange(ev);
    }
  }

  setValue(name, value) {
    let {data} = this.state;
    data[name] = value;
    this.setState({data, hasUnsavedData: true});
  }

  handleGoalsChange(ev) {
    if (ev.target.value.length <= 200) {
      this.handleChange(ev);
    }
  }

  handleKeyUp(keyEvent) {
    if (keyEvent.key === "Enter") {
      this.saveInputValue(keyEvent.target.name, keyEvent.target.value);
    }
    keyEvent.target.onblur = (ev) => this.saveInputValue(ev.target.name, ev.target.value);
  }

  handleGoalsKeyUp(keyEvent) {
    // if (keyEvent.key === "Enter") {
    //   this.saveInputValue("sd_con", keyEvent.target.value);
    // }
    keyEvent.target.onblur = (ev) => this.saveInputValue("sd_con", ev.target.value);
    this.adjustGoalsHeight(keyEvent.key);
  }

  handleSelectChange(ev) {
    this.saveInputValue(ev.target.name, ev.target.value);
  }

  handleSelectEnrolType(ev) {
    if (ev.target.value == 1) {
      // When 到期截至 is chosen, dont save it. Save it when have sd_deadline, together with it.
      this.setValue(ev.target.name, ev.target.value);
    } else {
      this.saveInputValue(ev.target.name, ev.target.value);
    }
  }

  adjustGoalsHeight(eventKey) {
    let height = $("#goalsdiv").height();
    height = height + (eventKey === "Enter" ? 18 : 0);
    $("#goals").height(height);
  }

  saveInputValue(name, value) {
    let {data, isFirstSave} = this.state;
    data[name] = value;
    this.setState(
      {data, hasUnsavedData: false, isFirstSave: typeof isFirstSave === "undefined"},
      this.saveSiteDemand(0, true)
    );
  }

  getData() {
    if (this.hash.direction === "job") {
      const { dispatch } = this.props;
      dispatch({
        type: "jobCreate/getSiteDemand",
        payload: {sd_id: this.hash.id},
      });
    } else {
      this.siteServiceTypeList();
    }
  }

  siteServiceTypeList() {
    const { dispatch } = this.props;
    dispatch({
      type: "jobCreate/siteServiceTypeList",
    });
  }

  saveSiteDemand(sd_state, isPartialSave) {
    // isPartialSave: Saving each input in real time, false at going to address list or at final btns
    // Saving the same data repeatedly will not prompt errors, so hasUnsavedData is not condition to save.
    let {data, sd_days, isDepositOn} = this.state;
    // let {details = {}} = this.props;
    const { dispatch } = this.props;

    data.sd_state = sd_state; // 1 save , 0 draft
    if (isDepositOn) {
      data.sd_top_days = sd_days;
    }

    this.setState({submitIsLoading: true, isPartialSave});

    dispatch({
      type: "jobCreate/save",
      payload: data,
    });
  }

  goToAddresses() {
    let {hasUnsavedData, data} = this.state;
    if(hasUnsavedData) {
      this.setState({willGoToAddresses: true});
      this.saveSiteDemand(0, false);
    } else if (hasVal(data.sd_id)) {
      history.push("/location-list/" + data.sd_id);
    } else {
      console.error("invALiD sd_id: " + data.sd_id);
    }
  }

  componentDidMount() {
    $('html').scrollTop(0);
    this.getData()
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch({
      type: "jobCreate/doRemoveAll",
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let {dispatch} = this.props;
    
    if (nextProps.saveRes) {
      let res = nextProps.saveRes;
      this.setState({submitIsLoading: false});
      if (res.code == 0) {
        // do nothing.
      } else if (this.state.isPartialSave) {
        let {data} = res;
        this.hash.id = data.sd_id;
        this.setState({data, isFirstSave: false, isPartialSave: false});
      } else if (this.state.willGoToAddresses) {
        this.setState({willGoToAddresses: false});
        history.push("/location-list/" + (res.data ? res.data.sd_id : ""));
      } else if (res.code == 2) {
        let depositerData = res.data;
        if (this.state.isDepositOn) {
          depositerData.sd_days = this.state.sd_days;
        }
        this.props.toggleDepositer(depositerData);
      } else {
        // update or create success
        let message = this.hash.direction === "job" ? "现场需求修改成功" : "现场需求发布成功";
        notification.success({className: "suc", message});

        history.push("/job/" + (res.data.sd_id));
      }
      dispatch({
        type: "jobCreate/doRemoveAll",
      });
    }

    if (nextProps.data) {
      let {data} = nextProps;
      let saved_sdl_count = data.sdl_count;

      this.setState({data, saved_sdl_count}, () => {
        this.adjustGoalsHeight();// height for existing text
      });
      this.siteServiceTypeList();
      dispatch({
        type: "jobCreate/doRemoveAll",
      });
    }

    if (nextProps.siteServiceTypeList) {
      let industries = toArrayIfPossible(nextProps.siteServiceTypeList);
      this.setState({industries});

      dispatch({
        type: "jobCreate/doRemoveAll",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.jobCreate,
  };
})(FlxJobCreateComponent);