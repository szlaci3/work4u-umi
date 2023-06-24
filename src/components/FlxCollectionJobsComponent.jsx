import PageParent from '@/components/PageParent.jsx';
import { Link } from 'umi';
import { connect } from 'dva';
import { notification } from 'antd';
import {
  hasVal,
  toArrayIfPossible,
  sanitizedContent,
} from '@/utils/utils';

class FlxCollectionJobsComponent extends PageParent {
  render() {
    let {
      data = [],
    } = this.state;

    return <div className="view jobs">
      {data.map(this.eachJob.bind(this))}
    </div> 
  }

  constructor(props) {
    super(props);
    this.loadList = this.loadList.bind(this);

    this.state = {search: props.search};
  }

  eachJob(item, i) {
    let defaultHeadImg = require("@/img/flx7.png");
    return <Link key={i} className="entry job" to={"/job/" + item.sd_id}>
      <div className="upper">
        <div className="line1">
          <div className="position">{item.sd_position}</div>
          <div className="float-right">
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
          </div>
          <div className="address">{item.sd_c_contact_address}</div>
        </div>
      </div>
    </Link>
  }

  loadList(novelty, value) {
    let query = {
      collect_type: 2,
      page: 1,
      search: this.state.search,
    };

    switch(novelty) {
      case "search": {
        this.isLastPage = false;
        if (!hasVal(value)) {
          this.isLoadingMore = true;//prevent the scroll causing loadBelow, till first page data loaded.
        }
        query.search = value;
        break;
      }
      case "page": {
        query.page = value;
        break;
      }
    }

    this.setState({[novelty]: value, page: query.page});

    const { dispatch } = this.props;
    dispatch({
      type: "collection/jobList",
      payload: query,
    });
  }

  addLoadBelowList() {
    if (!this.loadBelow) {
      this.loadBelow = $(window).on('touchmove', ev => {
        if ($(window).scrollTop() >= $('body').height() - window.innerHeight - 1 && !this.isLoadingMore && !this.isLastPage) {
          this.isLoadingMore = true;
          this.loadList("page", +this.state.page + 1);
        }
      });
    }
  }

  componentDidMount() {
    $('html').scrollTop(0);
    this.loadList("page", 1);
    this.addLoadBelowList();
  }

  componentWillUnmount() {
    $(window).off('touchmove');
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;

    if (nextProps.search !== this.props.search) {
      this.loadList("search", nextProps.search);
    }
    
    if (nextProps.jobListRes && !this.props.jobListRes) {
      let res = nextProps.jobListRes;
      if (res.code == 2) {// notice: some items were deleted by owners
        notification.warn({
          message: res.msg,
          duration: 0,
        });
      }

      if (res.code == 0) {
        this.isLastPage = true;
        // this.setState({errorMsg: res.msg});
      } else if (!res.data || !res.data.data || !res.data.data.length || res.data.data.length === 0) {
        // in FLX Lists, empty results is code 1, data.data [].
        this.isLastPage = true;
        if (res.data.current_page == 1) {
          this.setState({data: []});
        }
      } else {
        let data = toArrayIfPossible(res.data.data);
        if (!$.isArray(data)) {
          data = [];
        }
        if (+res.data.current_page > 1) {
          data = this.state.data.concat(data);
        } else {
          $('html').scrollTop(0);
        }
        if (+res.data.current_page >= +res.data.last_page) {
          this.isLastPage = true;
        }

        this.setState({data: data});
      }
      this.isLoadingMore = false;

      dispatch({
        type: "collection/doRemoveJobListRes",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.collection,
  };
})(FlxCollectionJobsComponent);