import React from 'react';
import { connect } from 'dva';
import { history, Link } from 'umi';
import { notification } from 'antd';
import Radio from '@/components/Radio.jsx';
import FlxPopup from '@/components/FlxPopup.jsx';
import Checkbox from '@/components/Checkbox.jsx';
import {
  toTwoDec,
} from '@/utils/utils';

class FlxDepositerComponent extends React.Component {
  render() {
    let {data, displayPayReturn, qrcImg} = this.state;

    let alipayLabel = <div>
      <div className="alipay-icon"/>
      支付宝
      <span className={"vprice" + (data.order_pay_way === "Alipay" ? " orange" : "")}>{data.money ? "￥" + data.money : ""}</span>
    </div>
    let wechatLabel = <div>
      <div className="wechat-icon"/>
      微信
      <span className={"vprice" + (data.order_pay_way === "Wxpay" ? " orange" : "")}>{data.money ? "￥" + data.money : ""}</span>
    </div>

    if (qrcImg) {
      return <div className="wechat-pay-qrc">
        <img className="upper-img" src={require("@/img/pay_wechat.png")} alt="Wxpay"/>
        <div className="body">
          <div className="scan-total">{data.money ? "￥" + data.money : ""}</div>
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

    return <div className={navigator.platform.slice(0,7)}>
      <FlxPopup displayPopup={displayPayReturn} msg="请您确认此次 支付结果" confirmText={"支付遇到问题"/* payment went wrong*/} closeText="支付已完成" confirm={this.closePayAndDepo.bind(this)} closePopup={this.goToJob.bind(this)}/>

      
      <div className="header">
        <div className="header-line">
          <div className="h-left back-btn" onClick={this.props.toggleDepositer.bind(null, false)} />

          <div className="h-middle">订单信息</div>

          <Link className="h-home" to="/"/>
        </div>
      </div>
      <div className="space-lines1"/>
      
      {!!+data.address_price && <div>
        <div className="vline1"><span>岗位押金信息</span></div>

        <div className="iiline4">
          <div className="o4">
            <div className="center reduced">岗位押金</div>
            <span className="">100元/5岗位</span>
          </div>
          <div className="o4">
            <div className="center reduced">我的岗位</div>
            
            <div className="quantity-explain">{data.address_count}个</div>
            <div className="iiright-value">
              ￥ {toTwoDec(data.address_price)}
            </div>
          </div>
        </div>
      </div>}

      {!!+data.top_price && <div>
        <div className="vline1"><span>置顶押金信息</span></div>

        <div className="iiline4">
          <div className="o4">
            <div className="center reduced">岗位押金</div>
            <span className="">50元/1岗位/1天</span>
          </div>
          <div className="o4">
            <div className="center reduced">需要岗位</div>
            
            <div className="quantity-explain">{data.top_count}个</div>
            <div className="iiright-value">
              ￥ {toTwoDec(data.top_price)}
            </div>
          </div>
        </div>
      </div>}

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

      <div className="limit-box bg-f4 moderate-down" key="2">
        <button type="button" className="btn2" onClick={this.purchase.bind(this)} >立即支付</button>
      </div>
    </div>
  }

  constructor(props) {
    super();

    // this.count_max = 1000;
    // this.priceOf5 = 100;
    // this.handleChange = this.handleChange.bind(this);
    this.isWeChatBrowser = window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger';
    let data = props.jobDepositerData;
    data.money = toTwoDec(+data.address_price + +data.top_price);
    // data.order_pay_way = this.isWeChatBrowser ? "Wxpay" : "Alipay";
    data.order_pay_way = "Wxpay"; //
    this.state = {data};
  }

  goToJob() {
    history.push("/job/" + this.props.jobDepositerData.sd_id);
  }

  closePayAndDepo() {
    this.setState({displayPayReturn: false},
      this.props.toggleDepositer.bind(null, false)
    );
  }

  // handleTermsChange(event) {
  //   this.setState({terms: event.target.checked});
  // }

  // toggleTerms() {
  //   this.setState({displayTerms: !this.state.displayTerms});
  // }

  // acceptTerms() {
  //   this.setState({terms: true, displayTerms: false});
  // }  

  // minus() {
  //   let {data} = this.state;
  //   data.count = Math.max(1, data.count - 5);
  //   data.money = data.count / 5 * this.priceOf5;
  //   this.setState({data});
  // }

  // plus() {
  //   let {data} = this.state;
  //   data.count = Math.min(this.count_max, Number(data.count) + 5);
  //   data.money = data.count / 5 * this.priceOf5;
  //   this.setState({data});
  // }

  handleRadio(ev) {
    let {data} = this.state;
    data.order_pay_way = ev.target.value;
    this.setState({data});
  }

  // handleChange(ev) {
  //   let {data} = this.state;
  //   data[ev.target.name] = ev.target.value;
  //   this.setState({data});
  // }

  purchase() {
    this.paymentWindow = this.state.data.order_pay_way === "Wxpay" ? null : window.open(); // if wechat pay, operate in present window.
    let {data} = this.state;
    let order_types = "";
    let days = "";
    if (data.address_price > 0 && data.top_price > 0) {
      order_types = '1,2';
      days = data.sd_days;
    } else if (data.top_price > 0) {
      order_types = 1;
      days = data.sd_days;
    } else if (data.address_price > 0) {
      order_types = 2;
    }

    let query = {
      order_pay_way: data.order_pay_way,
      order_types,
      order_sd_id: this.props.jobDepositerData.sd_id,
      days,
    }

    const { dispatch } = this.props;
    dispatch({
      type: "depositer/orderCreate",
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
                  this.setState({errorMsg: (err||"- ")+(res.err_code||" - ")+(res.err_desc||" - ")});
                } else if (err === "get_brand_wcpay_request:ok") {
                  history.push("/job/" + this.props.jobDepositerData.sd_id);
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
      type: "depositer/getQRCode",
      payload: url,
    });
  }

  wxMonitor(query) {
    const { dispatch } = this.props;
    dispatch({
      type: "depositer/wxMonitor",
      payload: query,
    });
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
      type: "depositer/doRemoveAll",
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
        type: "depositer/doRemoveAll",
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
        type: "depositer/doRemoveAll",
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
        type: "depositer/doRemoveAll",
      });
    }

  }
};

export default connect(state => {
  return {
    ...state.depositer,
  };
})(FlxDepositerComponent);