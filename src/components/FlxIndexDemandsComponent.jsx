import PageParent from '@/components/PageParent.jsx';
import { Link } from 'umi';
import { connect } from 'dva';
import {
  toArrayIfPossible,
  hasVal,
  sanitizedContent,
} from '@/utils/utils';

class FlxIndexDemandsComponent extends PageParent {
  render() {
    let {
      data = [],
      topList = [],
    } = this.state;

    return <div className="view">
      {topList.map(this.eachJob.bind(this))}
      {data.map(this.eachDemand.bind(this))}
    </div> 
  }

  constructor() {
    super();
    this.state = {};
  }

  eachDemand(item, i) {
    return <Link key={i} className="entry demand" to={"/demand/" + item.d_id}>
      <div className="img">
        <img src={cloud + item.d_title_pic}/>
      </div>
      <div className="text">
        <div className="title">{item.d_title}</div>
        <div className="description">{this.htmlDecode(item.d_describe)}</div>
        <div className="price">
          <span className="s">￥ </span>
          {item.d_budget}
          {item.d_budget && <span className="s">/元</span>}
        </div>
        <div className="lower">
          <span className="nickname">{item.d_member_name}</span>
          <span className="city">{item.d_city}</span>
          <span className="direction">需求</span>
        </div>
      </div>
    </Link>
  }

  eachJob(item, i) {
    let defaultHeadImg = require("@/img/flx7.png");
    return <Link key={i} className="entry job" to={"/job/" + item.sd_id}>
      <div className="upper">
        <div className="line1">
          <div className="position">{item.sd_position}</div>
          <div className="float-right">
            <div className="hot-icon"/>
            <div className="qualifications">{(item.sd_city || "") + " | " + (item.sd_qualifications || "")}</div>
          </div>
        </div>
        <div className="con" dangerouslySetInnerHTML={sanitizedContent(item.sd_con)} />
      </div>

      <div className="job-lower">
        <div className="job-img">
          <img src={hasVal(item.sd_member_profile) ? (cloud + item.sd_member_profile) : null} onError={(ev) => {ev.target.src = defaultHeadImg}}/>
        </div>
        <div className="right">
          <div>
            <span className="company">{item.sd_cname}</span>
            <span className="date">{item.sd_released_time}</span>
          </div>
          <div className="address">{item.sd_c_contact_address}</div>
        </div>
      </div>
    </Link>
  }

  loadTopList() {
    const { dispatch } = this.props;

    dispatch({
      type: "index/topList",
    });
    // $.ajax({
    //   url: flxUrl + "/index/topList",
    //   // data: query,
    //   dataType: "json",
    //   success: res => {
    //     if (res.code == 0) {
    //       this.setState({errorMsg: res.msg});
    //     } else {
    //       this.setState({topList: res.data});
    //     }
    //   },
    //   error: (x, s, e) => {
    //     this.setState({errorMsg: e});
    //   }
    // });
  }

  loadPage(value) {
    const { dispatch } = this.props;

    dispatch({
      type: "index/demandList",
      payload: {page: value},
    });
  }

  addLoadBelowPage() {
    if (!this.loadBelow) {
      $(window).off('touchmove');
      this.loadBelow = $(window).on('touchmove', ev => {
        if ($(window).scrollTop() >= $('body').height() - window.innerHeight - 1 && !this.isLoadingMore && !this.isLastPage) {
          this.isLoadingMore = true;
          this.loadPage(+this.state.page + 1);
        }
      });
    }
  }

  componentDidMount() {
    $('html').scrollTop(0);
    this.loadTopList();
    this.loadPage(1);
    this.addLoadBelowPage();
  }

  componentWillUnmount() {
    $(window).off('touchmove');
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;

    if (nextProps.topListRes) {
      let res = nextProps.topListRes;
      if (res.code !== 0) {
        this.setState({topList: res.data});
      }

      dispatch({
        type: "index/doRemoveTopListRes",
      });
    }

    if (nextProps.demandListRes) {
      let res = nextProps.demandListRes;
      if (res.code == 0) {
        this.isLastPage = true;
        // this.setState({errorMsg: res.msg});
      } else if (!res.data || !res.data.data || !res.data.data.length || res.data.data.length === 0) {
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
        type: "index/doRemoveDemandListRes",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.index,
  };
})(FlxIndexDemandsComponent);