import React from 'react';
import { connect } from 'dva';
import { history, Link } from 'umi';
import { notification } from 'antd';
import Radio from '@/components/Radio.jsx';
import FlxPopup from '@/components/FlxPopup.jsx';
import Checkbox from '@/components/Checkbox.jsx';
import FlxTerms from '@/components/FlxTerms.jsx';
import {
  hasVal,
  isIOS,
} from '@/utils/utils';

// data to send to orderCreate:

// if service
//       s_id
//       d_user_type
////  And these are common:
//       order_pay_price 
//       order_appointment_time
//       rs_d_phone
//       rs_d_ps
//       order_pay_way
//       order_number /if


// if offer // (my demand -> Offer, right button)
//       rs_id
////  And these are common:
//       order_pay_price 
//       order_appointment_time
//       rs_d_phone
//       rs_d_ps
//       order_pay_way
//       order_number /if

class FlxCheckoutComponent extends React.Component {
  render() {
    let {isOrderDetails, member_nickname, title, money, id} = this.props;
    let {data, step, displayTerms, displayPayReturn, qrcImg} = this.state;
    let canPurchase = data.order_appointment_time && data.rs_d_phone;

    if (displayTerms) {
      return <FlxTerms toggle={this.toggleTerms.bind(this)} acceptTerms={this.acceptTerms.bind(this)}/>
    }

    if (qrcImg) {
      return <div className="wechat-pay-qrc">
        <img className="upper-img" src={require("@/img/pay_wechat.png")} alt="Wxpay"/>
        <div className="body">
          <div className="scan-total">{money ? "￥" + money : ""}</div>
          <div className="scan-center">
            <img src={SERVERIP + qrcImg} alt=""/>
          </div>
          <div className="please-scan">
            请使用微信扫一扫<br/>
            扫描二维码完成支付
          </div>
        </div>
      </div>
    }

    let payReturnPopup = <FlxPopup displayPopup={displayPayReturn} msg="请您确认此次 支付结果" confirmText={"支付遇到问题"/* payment went wrong*/} closeText="支付已完成" confirm={this.props.afterClosePopup} closePopup={this.props.afterClosePopup}/>


    if (step === 1) {
      return <div className={navigator.platform.slice(0,7)}>
        {payReturnPopup}

        
        <div className="header">
          <div className="header-line">
            <div className="h-left back-btn" onClick={this.props.closeCheckout} />

            <div className="h-middle">确认订单</div>

            <Link className="h-home" to="/"/>
          </div>
        </div>
        <div className="space-lines1"/>
        
        <div className="vline1">
          <span className="porange">{member_nickname}</span>
          宇宙最强在工作室
        </div>

        <div className="oline4">
          <div className="o4">
            <div className="center">服务内容</div>
            <span>{title}</span>
          </div>
          <div className="o4">
            <div className="center">服务单价</div>
            <span>{money ? "￥" + money : ""}</span>
          </div>
          <div className="o4">
            <div className="center">需求时间</div>
            <input className="vinput" type="date" name="order_appointment_time" value={data.order_appointment_time || ""} onChange={this.handleChange} placeholder="请选择"/>
            {isIOS && <div className="go "/>}
          </div>
          <div className="o4">
            <div className="center">联系电话</div>
            <input className="vinput" type="text" name="rs_d_phone" value={data.rs_d_phone || ""} onChange={this.handleChange} placeholder="Please fill in"/>
          </div>
          <div className="o4">
            <div className="center">需求备注</div>
            <div className="vcount">{(data.rs_d_ps ? data.rs_d_ps.length : 0) + " / 100"}</div>
            <div className="vvalue ver-top">
              <textarea id="goals" className="vgoals" name="rs_d_ps" value={data.rs_d_ps || ""} onChange={this.handleGoalsChange.bind(this)} onKeyUp={this.handleGoalsKeyUp.bind(this)}/>
              <div id="goalsdiv" className="vgoals">{data.rs_d_ps}</div>
            </div>
          </div>
        </div>
        <div className="vline2">
          <div>总价：</div>
          <span className="orange">{money ? "￥" + money : ""}</span>
        </div>

        {location.pathname.indexOf("flx-offer.html") === -1 && <div className="terms oterms m-user-agreement">
          <Checkbox
            type="checkbox"
            name="terms"
            checked={this.state.terms}
            handleChange={this.handleTermsChange.bind(this)}
            label={<div>我已阅读并同意《<a onClick={this.toggleTerms.bind(this)} >珺才人力灵活用工平台用户使用规则</a>》</div>}
          />
        </div>}

        <div className="limit-box bg-f4 moderate-down">
          <button type="button" className="btn2" onClick={this.goToStep.bind(this, 2)} disabled={!this.state.terms || !canPurchase}>提 交</button>
        </div>
      </div>

    } else {
      let alipayLabel = <div>
        <div className="alipay-icon"/>
        支付宝
        <span className={"vprice" + (data.order_pay_way === "Alipay" ? " orange" : "")}>{money ? "￥" + money : ""}</span>
      </div>
      let wechatLabel = <div>
        <div className="wechat-icon"/>
        微信
        <span className={"vprice" + (data.order_pay_way === "Wxpay" ? " orange" : "")}>{money ? "￥" + money : ""}</span>
      </div>

      return <div className={navigator.platform.slice(0,7)}>
        {payReturnPopup}

        
        <div className="header">
          <div className="header-line">
            <div className="h-left back-btn" onClick={isOrderDetails ? this.props.closeCheckout : this.goToStep.bind(this, 1)} />

            <div className="h-middle">支付</div>

            <Link className="h-home" to="/"/>
          </div>
        </div>
        <div className="space-lines1"/>
        
        <div className="vline1"><span>订单信息</span></div>

        <div className="oline4">
          <div className="o4">
            <div className="center">服务内容</div>
            <span className={isOrderDetails ? "disabled-color" : ""}>{title}</span>
          </div>
          <div className="o4">
            <div className="center">服务单价</div>
            <span className="orange">{money ? "￥" + money : ""}</span>
          </div>
          <div className="o4">
            <div className="center">需求时间</div>
            <input className="vinput" type="date" name="order_appointment_time" value={data.order_appointment_time || ""} onChange={this.handleChange} placeholder={isOrderDetails ? "" : "请选择"} disabled={isOrderDetails}/>
            {!isOrderDetails && isIOS && <div className="go "/>}
          </div>
          <div className="o4">
            <div className="center">联系电话</div>
            <input className="vinput" type="text" name="rs_d_phone" value={data.rs_d_phone || ""} onChange={this.handleChange} placeholder={isOrderDetails ? "" : "请选择"} disabled={isOrderDetails}/>
          </div>
          {hasVal(data.order_number) && <div className="o4">
            <div className="center">联系电话</div>
            <span>{data.order_number}</span>
          </div>}
          <div className="o4">
            <div className="center">需求备注</div>
            <div className="vcount">{(data.rs_d_ps ? data.rs_d_ps.length : 0) + " / 100"}</div>
            <div className="vvalue ver-top">
              <textarea id="goals2" className="vgoals" name="rs_d_ps" value={data.rs_d_ps || ""} onChange={this.handleGoalsChange.bind(this)} onKeyUp={this.handleGoalsKeyUp.bind(this)} disabled={isOrderDetails}/>
              <div id="goalsdiv" className="vgoals">{data.rs_d_ps}</div>
            </div>
          </div>
        </div>

        <div className="vline1">支付方式</div>

        <Radio
          mainClass="vline3"
          optionClass="voption"
          type="radio7"
          name="order_pay_way"
          default={data.order_pay_way}
          value={data.order_pay_way}
          handleRadio={this.handleRadio.bind(this)}
          options={this.isWeChatBrowser ? (
          [
            {label: wechatLabel, value: "Wxpay"}
          ]) : ([
            // {label: alipayLabel, value: "Alipay"},
            {label: wechatLabel, value: "Wxpay"}
          ])}
        />

        {location.pathname.indexOf("flx-offer.html") === -1 && <div className="terms oterms m-user-agreement">
          <Checkbox
            type="checkbox"
            name="terms"
            checked={this.state.terms}
            handleChange={this.handleTermsChange.bind(this)}
            label={<div>我已阅读并同意《<a onClick={this.toggleTerms.bind(this)} >珺才人力灵活用工平台用户使用规则</a>》</div>}
          />
        </div>}

        <div className="limit-box bg-f4 moderate-down" key="2">
          <button type="button" className="btn2" onClick={this.purchase.bind(this)} disabled={!this.state.terms || !canPurchase}>立即支付</button>
        </div>
      </div>
    }
  }

  constructor(props) {
    super();
    let {rs_finish_time, order_d_phone, order_d_ps} = props;//order_d_phone, order_d_ps if come from orderDetails

    this.handleChange = this.handleChange.bind(this);
    this.isWeChatBrowser = window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger';
    this.state = {
      terms: true,
      data: {
        order_appointment_time: rs_finish_time,
        rs_d_phone: order_d_phone,
        rs_d_ps: order_d_ps,
        // order_pay_way: this.isWeChatBrowser ? "Wxpay" : "Alipay",
        order_pay_way: "Wxpay", //
      },
      step: props.isOrderDetails ? 2 : 1
    }; // If come from orderDetails (state: 1 = not paid), props.step has value (2).
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

  handleRadio(ev) {
    let {data} = this.state;
    data.order_pay_way = ev.target.value;
    this.setState({data});
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
    $("#goals2").height(height);
  }

  purchase() {
    this.paymentWindow = this.state.data.order_pay_way === "Wxpay" ? null : window.open(); // if wechat pay, operate in present window.
    let {money, id, rs_id, d_user_type, isOrderDetails} = this.props;
    let {data} = this.state;
    // in case of orderDetails order_number and order_pay_way is enough.
    let query;
    if (isOrderDetails) {
      query = {
        order_number: this.props.order_number,
        order_pay_way: data.order_pay_way,
      }
    } else {
      query = {
        order_pay_price: money,
        rs_id: rs_id || "",
        s_id: id || "",
        d_user_type: d_user_type || "",
        order_appointment_time: data.order_appointment_time,
        rs_d_ps: data.rs_d_ps,
        rs_d_phone: data.rs_d_phone,
        order_pay_way: data.order_pay_way,
      }
      if (hasVal(data.order_number)) {
        query.order_number = data.order_number;
      }
    }

    const { dispatch } = this.props;
    dispatch({
      type: "checkout/orderCreate",
      payload: query,
    });
  }

  jsApiCall() {
        WeixinJSBridge.invoke(
            'getBrandWCPayRequest',
            this.state.jsonApiParameters.data,
            function(res){
                var err = res.errMsg || res.err_msg;
                WeixinJSBridge.log(err);
                // can be "get_brand_wcpay_request:ok", "get_brand_wcpay_request:cancel", other errors
                if (err.indexOf("get_brand_wcpay_request") === -1) {
                  notification.warn({
                    className: "erm",
                    message: (err||"- ")+" "+(res.err_code||"- ")+" "+(res.err_desc||"- "),
                    duration: 0,
                  });
                } else if (err === "get_brand_wcpay_request:ok") {
                  history.push("/service-order-list");
                }
            }.bind(this)
        );
  }

  callpay() {
       if (typeof WeixinJSBridge == "undefined"){
         if( document.addEventListener ){
           document.addEventListener('WeixinJSBridgeReady', this.jsApiCall, false);
         }else if (document.attachEvent){
           document.attachEvent('WeixinJSBridgeReady', this.jsApiCall); 
           document.attachEvent('onWeixinJSBridgeReady', this.jsApiCall);
         }
       }else{
         this.jsApiCall();
       }
  }

  getQRCode(url) {
    const { dispatch } = this.props;
    dispatch({
      type: "checkout/getQRCode",
      payload: url,
    });
  }

  wxMonitor(query) {
    const { dispatch } = this.props;
    dispatch({
      type: "checkout/wxMonitor",
      payload: query,
    });
  }

  goToStep(step) {
    $('html').scrollTop(0);
    this.setState({step}, this.handleGoalsKeyUp.bind(this, {}));
  }

  openPayReturn() {
    this.setState({displayPayReturn: true});
  }

  componentDidMount() {
    $('html').scrollTop(0);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: "checkout/doRemoveAll",
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let {dispatch} = this.props;
    
    if (nextProps.wxMonitorRes) {
      let {wxMonitorRes} = nextProps;
      if (wxMonitorRes.code != 1) {
        this.monitor = window.setTimeout(() => {
          let {order_pay_number} = this.state;
          this.wxMonitor({order_pay_number});
        }, 1000);
      } else {
        window.location = wxMonitorRes.url;
      }

      dispatch({
        type: "checkout/doRemoveAll",
      });
    }

    if (nextProps.getQRCodeRes) {
      let {getQRCodeRes} = nextProps;
      if (this.isWeChatBrowser) {
        this.setState({jsonApiParameters: getQRCodeRes}, this.callpay);
      } else {
        this.setState({qrcImg: getQRCodeRes.img, order_pay_number: getQRCodeRes.order_pay_number});
        this.wxMonitor({order_pay_number: getQRCodeRes.order_pay_number});
      }

      dispatch({
        type: "checkout/doRemoveAll",
      });
    }

    if (nextProps.orderCreateRes) {
      let {orderCreateRes} = nextProps;
      let {data} = this.state;
      if (orderCreateRes.code == 1) {
        if (data.order_pay_way === "Alipay") {
          this.paymentWindow.location = orderCreateRes.data;
          this.openPayReturn();
        } else if (data.order_pay_way === "Wxpay") {
          this.getQRCode(orderCreateRes.data);
        }
      } else {
        this.paymentWindow && this.paymentWindow.close();
        notification.warn({
          className: "erm",
          message: orderCreateRes.msg,
          duration: 0,
        });
      }

      dispatch({
        type: "checkout/doRemoveAll",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.checkout,
  };
})(FlxCheckoutComponent);