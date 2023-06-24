import React from 'react';
import { connect } from 'dva';
import { history, Link } from 'umi';
import Checkbox from '@/components/Checkbox.jsx';
import FlxTerms from '@/components/FlxTerms.jsx';

class FlxMakeOfferComponent extends React.Component {
  render() {
    let {member_nickname, title, money, id} = this.props;
    let {data, displayTerms} = this.state;
    let canSubmit = +data.offer && data.finish_time;

    if (displayTerms) {
      return <FlxTerms toggle={this.toggleTerms.bind(this)} acceptTerms={this.acceptTerms.bind(this)}/>
    }

    return <div className={navigator.platform.slice(0,7)}>
      
      <div className="header">
        <div className="header-line">
          <div className="h-left back-btn" onClick={this.props.closeConfirmReceipt} />

          <div className="h-middle">确认订单</div>

          <Link className="h-home" to="/"/>
        </div>
      </div>
      <div className="space-lines1"/>
      
      <div className="o3">
        <div className="onick" >{member_nickname}</div>
        <span>将为您提供服务</span>
        <div className="clear-both"/>
      </div>


      <div className="oline4">
        <div className="o4">
          <div>服务内容</div>
          <span>{title}</span>
        </div>
        <div className="o4">
          <div>预算价格</div>
          <span>{money ? "￥" + money : ""}</span>
        </div>
        <div className="o4">
          <div>我的接单价格</div>
          <div className="vinline">￥</div>
          <input className="vinput voffer repositioned" type="number" name="offer" value={data.offer || ""} onChange={this.handleChange} placeholder="Please fill in"/>
        </div>
        <div className="o4">
          <div>预计完成时间</div>
          <input className="vinput" type="date" name="finish_time" value={data.finish_time || ""} onChange={this.handleChange} placeholder="请选择"/>
        </div>
        <div className="o4">
          <div>详细描述</div>
          <div className="vcount">{(data.con ? data.con.length : 0) + " / 100"}</div>
          <div className="vvalue">
            <textarea id="goals" className="vgoals" name="con" value={data.con || ""} onChange={this.handleGoalsChange.bind(this)} onKeyUp={this.handleGoalsKeyUp.bind(this)}/>
            <div id="goalsdiv" className="vgoals">{data.con}</div>
          </div>
        </div>
      </div>

      <div className="terms oterms m-user-agreement">
        <Checkbox
          type="checkbox"
          name="terms"
          checked={this.state.terms}
          handleChange={this.handleTermsChange.bind(this)}
          label={<div>我已阅读并同意《<a onClick={this.toggleTerms.bind(this)} >珺才人力灵活用工平台用户使用规则</a>》</div>}
        />
      </div>

      <div className="limit-box bg-f4 moderate-down">
        <button type="button" className="btn2" onClick={this.purchase.bind(this)} disabled={!this.state.terms || !canSubmit}>提 交</button>
      </div>
    </div>
  }

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.isWeChatBrowser = window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger';
    this.state = {data: {}, terms: true};
  }

  handleTermsChange(event) {
    this.setState({terms: event.target.checked});
  }

  toggleTerms() {
    this.setState({displayTerms: !this.state.displayTerms});
  }

  acceptTerms() {
    this.setState({terms: true, displayTerms: false});
  }

  handleChange(ev) {
    let {data} = this.state;
    data[ev.target.name] = ev.target.value;
    this.setState({data});
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

  purchase() {
    let {member_nickname, money, id, d_member_id} = this.props;
    let {data} = this.state;
    let query = {
      d_id: id,
      d_member_id: d_member_id,
      
      offer: data.offer,
      finish_time: data.finish_time,
      con: data.con,
      // order_number: data.order_number || {},
    }

    const { dispatch } = this.props;
    dispatch({
      type: "makeOffer/request",
      payload: query,
    });
  }

  goToMyOffers() {
    history.push("/offer-list");
  }

  componentDidMount() {
    $('html').scrollTop(0);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: "makeOffer/doRemoveAll",
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let {dispatch} = this.props;
    
    if (nextProps.requestRes) {
      this.goToMyOffers();

      dispatch({
        type: "makeOffer/doRemoveAll",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.makeOffer,
  };
})(FlxMakeOfferComponent);