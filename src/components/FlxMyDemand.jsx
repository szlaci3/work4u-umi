import PageParent from '@/components/PageParent.jsx';
import FlxPopup from '@/components/FlxPopup.jsx';
import { history, Link } from 'umi';
import { connect } from 'dva';
import { notification } from 'antd';
import {
  toArrayIfPossible,
  hasVal,
} from '@/utils/utils';



class FlxMyDemand extends PageParent {
  render() {
    let {data = [], isOffersView, displayActions, displayShare, displaySureDelete} = this.state;
    let {info = {}} = this.props;
    let count = data.length || null;

    return <div className={navigator.platform.slice(0,7)}>
      <FlxPopup
        displayPopup={displaySureDelete}
        msg="是否确认删除需求？"
        confirm={this.deleteDemand.bind(this)}
        confirmText="删除"
        closePopup={this.toggleSureDelete.bind(this)}
        closeText="取消"
        />
      
      <div className="header">
        <div className="header-line">
          <div className="h-left back-btn" onClick={history.goBack}/>

          <div className="ih-middle">我的需求</div>
          <div className="ih-right">
            <div className="m3dots" onClick={this.toggleActions.bind(this, true)}/>
            {displayActions && <div className="mactions" onClick={this.toggleActions.bind(this, false)}>
              <div>
                <div onClick={this.toggleShare}>分享</div>
                {info.d_state == -1 ? (
                  <div onClick={this.publish.bind(this)}>上架</div>
                ) : (
                  <div onClick={this.unpublish.bind(this)}>下架</div>
                )}
                <Link to={"/demand-create/demand/" + this.hash.id}>编辑</Link>
                <div onClick={this.toggleSureDelete.bind(this)}>删除</div>

                <div className="triangle-up"><div/></div>
              </div>
            </div>}
          </div> 
        </div>
      </div>
      <div className="space-lines1"/>

      <div className={"popup share-popup" + (displayShare ? "" : " not-shown")}>
        <div className="bdsharebuttonbox" data-tag="share_1">
          <img className="kclose" src={require("@/img/kclose.png")} alt="" onClick={this.toggleShare}/>

          <div className="title">分享</div>
          <div className="body">
            <a className="bds_sqq qq-icon" data-cmd="sqq"/>
            <a className="bds_weixin weixin-icon" data-cmd="weixin"/>
            <a className="bds_tsina tsina-icon" data-cmd="tsina"/>
            <div className="space-bsbutton"/>
          </div>
        </div>
      </div>

      <div>
        <div className="m1">
          <img className="full" src={info.d_title_pic && (cloud + info.d_title_pic)}/>
          <div className="jline1">{info.d_title}</div>
          <div className="jline2">
            <div className="left">
              <span className="s">￥ </span>
              {info.d_budget}
              <span className="s">/元</span>
            </div>
            <div className="right">
              <div className="eye"/>
              {info.d_browse}
              <span className=""> 人浏览</span>
            </div>
            
          </div>
        </div>
        
        <div className="m2">
          <div>
            <div className={"mtab " + (isOffersView ? "" : "active")} onClick={this.switchView.bind(this, false)}><div>需求信息</div></div>
            <div className={"mtab " + (isOffersView ? "active" : "")} onClick={this.switchView.bind(this, true)}><div>接单服务商</div></div>
          </div>
        </div>

        {isOffersView ? (
          <div>
            <div className="m3">参与该需求的服务商{count && "（" + count + "）"}</div>

            <div className="m4 pb1">
              {data.map(this.eachOffer.bind(this))}
            </div>


          </div>
        ) : (
          <div>
            <div className="shelf">
              <div className="moscow">
                <div/>
                <span>需求信息</span>
              </div>
              <div className="soci">
                <div>
                  <label>需求标题</label>
                  {info.d_title}
                </div>
                <div>
                  <label>预算金额</label>
                  {info.d_budget}
                </div>
                <div>
                  <label>需求城市</label>
                  {info.d_city}
                </div>
                <div>
                  <label>完成时间</label>
                  {info.d_start_time} ~ {info.d_end_time}
                </div>
                <div>
                  <label>详细描述</label>
                  <div className="describe-div">{this.htmlDecode(info.d_describe)}</div>
                </div>
              </div>
            </div>

            <div className="shelf">
              <div className="moscow">
                <div/>
                <span>需求详情</span>
              </div>
              <div className="jcon">
                <div className="text">
                  {this.htmlDecode(info.d_con)}
                </div>
                {info.d_file && info.d_file.map(this.eachImage.bind(this))}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  }

  constructor(props) {
    super(props);
    this.hash = props.match.params;
    this.toggleShare = this.toggleShare.bind(this);

    this.state = {isOffersView: true};
  }

  eachOffer(offer, i) {
    let {info} = this.state;
    let defaultHeadImg = require("@/img/flx7.png");

    return <Link key={i} className="offer" to={"/offer/" + offer.rs_id}>
      <div className="left">
        <div className="img">
          <img src={hasVal(offer.member_profile) ? (cloud + offer.member_profile) : null} onError={(ev) => {ev.target.src = defaultHeadImg}}/>
        </div>
        <div className="person">个人</div>
      </div>
      <div className="right">
        <div className="name">
          {offer.member_nickname}
        </div>
        <div className="mline2">
          <div>
            <span>服务雇主数</span>
            <span className="orange">{offer.order_count}</span>
          </div>
          <div>
            <span>好评率</span>
            <span className="orange">{hasVal(offer.appraise) && offer.appraise + "%"}</span>
          </div>
          <div>
            <span>成交额</span>
            <span className="orange">{hasVal(offer.sum_cost) && "￥" + offer.sum_cost + "万"}</span>
          </div>
        </div>
        <div className="mmore">
          <div>报价</div>
          <span>{hasVal(offer.rs_offer) && "￥" + offer.rs_offer}</span>
          <div>完成日期</div>
          <span>{offer.rs_finish_time}</span>
        </div>
      </div>

    </Link>
  }

  toggleActions(bool) {
    this.setState({displayActions: bool});
  }

  toggleShare() {
    if (!this.state.displayShare) {
      if (!this.state.shareScriptAdded) {
        this.addShare(this.state.data);
      }
      // code for scrolltop will make the wechat qr code go too much to top, exceeding screen
      this.scrolled = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop || 0;
      $('body').addClass("fixed-body").css({marginTop: - this.scrolled});
      this.setState({displayShare: true, shareScriptAdded: true});
    } else {
      $('body').removeClass("fixed-body").css({marginTop: 0});
      $('body').scrollTop(this.scrolled);
      this.setState({displayShare: false});
    }
  }

  unpublish() {
    this.changeState(-1);
  }

  publish() {
    this.changeState(0);
  }

  deleteDemand() {
    this.toggleSureDelete();
    this.changeState(-2);
  }

  toggleSureDelete() {
    this.setState({displaySureDelete: !this.state.displaySureDelete});
  }

  changeState(state) {
    const { dispatch } = this.props;

    this.setState({intention: state});
    dispatch({
      type: "myDemand/demandChangeState",
      payload: {d_id: this.hash.id, d_state: state},
    });
  }

  switchView(bool) {
    this.setState({isOffersView: bool});
  }

  eachImage(item, i) {
    return <img className="full" src={cloud + item} key={i}/>
  }

  loadPage(value) {
    let query = {
      d_id: this.hash.id,
      page: value,
    };
    const { dispatch } = this.props;

    dispatch({
      type: "myDemand/offerList",
      payload: query,
    });
  }

  addLoadBelowPage() {
    if (!this.loadBelow) {
      this.loadBelow = $(window).on('touchmove', ev => {
        if ($(window).scrollTop() >= $('body').height() - window.innerHeight - 1 && !this.isLoadingMore && !this.isLastPage) {
          this.isLoadingMore = true;
          this.loadPage(+this.state.page + 1);
        }
      });
    }
  }

  addShare(data) {
    window.setTimeout(() => {
      window._bd_share_config = {
        common : {
          bdText : '珺才人力灵活用工平台', 
          bdDesc : data.d_title + "-珺才人力灵活用工平台", 
          bdUrl : location.href,
          bdPic : data.d_title_pic && (cloud + data.d_title_pic)
        },
        share : [{
          "bdSize" : 16
        }]
      }
      var body = document.getElementsByTagName('body')[0];
      var fileref = document.createElement('script');
      fileref.setAttribute("type","text/javascript");
      fileref.setAttribute("src",'./static/api/js/share.js?v='+~(-new Date()/36e5));
      body.appendChild(fileref);
    }, 20);
  }

  componentDidMount() {
    $('html').scrollTop(0);
    this.loadPage(1);
    this.addLoadBelowPage();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch({
      type: "myDemand/doRemoveAll",
    });
    $(window).off('touchmove');
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let {dispatch} = this.props;
 
    if (nextProps.offerListRes) {
      let res = nextProps.offerListRes;
      if (res.code == 0) {
        this.isLastPage = true;
      } else if (res.data.data.length === 0) {
        // in FLX Lists, empty results is code 1, data.data [].
        this.isLastPage = true;
        if (res.data.current_page == 1) {
          this.setState({data: []});
        }
        this.setState({page: res.data.current_page});
      } else {
        let data = toArrayIfPossible(res.data.data);
        if (!$.isArray(data)) {
          data = [];
        }
        if (+res.data.current_page > 1) {
          data = this.state.data.concat(data);
        }
        if (+res.data.current_page >= +res.data.last_page) {
          this.isLastPage = true;
        }

        this.setState({data: data, page: res.data.current_page});
      }
      this.isLoadingMore = false;

      dispatch({
        type: "myDemand/doRemoveAll",
      });
    }

    if (nextProps.demandChangeStateRes) {
      let res = nextProps.demandChangeStateRes;
      if (res.code === 1) {
        if (this.state.intention === -2) {
          this.setState({intention: false});
          notification.success({className: "suc", message: "需求已删除"});
          history.push("/profile");
        } else {
          notification.success({className: "suc", message: this.state.intention === -1 ? "需求已下架" : "需求已上架"});
          this.setState({intention: false});
          this.props.getData();
        }
      }

      dispatch({
        type: "myDemand/doRemoveAll",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.myDemand,
  };
})(FlxMyDemand);