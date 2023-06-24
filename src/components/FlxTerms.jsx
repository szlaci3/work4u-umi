import React from 'react';
import { Link } from 'umi';

class FlxTerms extends React.Component {
  closePopup(e) {
    e.preventDefault();
    this.props.toggle();
  }

  getTermsContent() {
    return <div id="uAContent" className="ua-content flx-terms">
      <div id="title" className="title">
        珺才人力灵活用工平台用户使用规则
      </div>
      <div id="content" className="content-inner">
        <div className="text">
<p>
1、 用户 必须确保订单信息的真实 、完整， 且不包含《 珺才人力 灵活用工 平台服务协议 》第
六章第一条所列任何情况 。
</p>
<p>
2、 用户不得通过本平台唆使、诱导 、 威胁、 强迫其他用户从事与本平台无关的或 违反国家
法律法规禁止性规定的 任何活动与工作。
</p>
<p>
3、 服务方在接单时，必须确保其服务能完全满足需求方的描述，包括但不限于 完成 时间、
需求内容、需求形式及相应材料、证件、素材及服务明细数据等。
</p>
<p>
4、 如因 服务方预估不足 ，导致服务方无法完成需求方的需求内容或需要延期时，服务方应
提前与需求方进行沟通，并给出对应的方案寻求需求方的同意。如无法取得需求方同意
需求方提出取消订单的，服务方应在 7 天内全额退还需求方已支付的所有费用。
</p>
<p>
5、 服务方接单后，在未与需求方沟通的情况下，无故未完成订单服务内容的，或未按照订
单要求到现场进行服务的：<br/>
第一次：扣除信用值10分，且在7天内无法再接其他订单或参与报价；<br/>
第二次：扣除信用值20分，且在从扣分当天起30天内无法再接其他订单或参与报价；
</p>

          <p className="align-right">
          上海珺才企业管理咨询有限公司
          </p>
          <p className="align-right">
          2020 年 7 月 1 日
          </p>
        </div>
      </div>
    </div>
  }

  render(){
    return <div className="m-agreement-wrapper">
      <div id="header" className="m-agreement-header">
        <Link to="/home" className="m-agreement-logo">
          <img src={require("@/img/ss-logo-50.png")} alt="Super Staffing Logo" />
        </Link>
      </div>
      <img className="terms-header-space" src={require("@/img/ss-logo-50.png")} alt="" />
      {this.getTermsContent()}
      <div id="mUAButtons" className="m-ua-buttons">
        <button type="button" className="m-button-denim" onClick={this.props.acceptTerms} >接受</button>
        <button type="button" className="m-button-denim cancel" onClick={this.closePopup.bind(this)} >取消</button>
      </div>
    </div>
  }

  componentDidMount() {
    $('html').scrollTop(0);
  }
}

export default FlxTerms;