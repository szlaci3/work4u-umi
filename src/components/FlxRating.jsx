import PageParent from '@/components/PageParent.jsx';
import { Link } from 'umi';
import { connect } from 'dva';
import {
  toArrayIfPossible,
  hasVal,
} from '@/utils/utils';
import {
  SmallRating,
} from '@/components/FlxElements.jsx';

class FlxRating extends PageParent {
  render() {
    let {data = []} = this.state;
    let {tag, tagCount} = this.props;
    
    return <div className={"rating " + (navigator.platform.slice(0,7))}>
      
      <div className="header">
        <div className="header-line">
          <div className="h-left back-btn" onClick={this.props.toggleRatingView} />

          <div className="h-middle">评价详情</div>

          <Link className="h-home" to="/"/>
        </div>
      </div>
      <div className="space-lines1"/>

      <div className="book-store">
        <div className="shelf">
          <div className="jline3">
            客户评价
            <span className="tag-count">{"（" + (tagCount || 0) + "）"}</span>
          </div>
          <div className="jrating tag-box">

            {tag.map(this.props.eachTag)}

          </div>
        </div>

        <div className="shelf">
          {data.map(this.eachReview)}
        </div> 
      </div> 

      {this.props.children}
      
    </div> 
  }

  constructor() {
    super();
    this.state = {};
  }

  eachReview(rev, i) {
    let defaultHeadImg = require("@/img/flx7.png");

    return <div className="review" key={i}>
      <Link to={"/profile/" + rev.appraise_member_id}>
        <div className="img">
          <img src={hasVal(rev.appraise_profile) && (cloud + rev.appraise_profile)} onError={(ev) => {ev.target.src = defaultHeadImg}}/>
        </div>
        <div className="name">{rev.appraise_name}</div>
      </Link>
      <SmallRating value={rev.appraise || 0}/>
      <div className="text">
        <div className="con">{rev.appraise_con}</div>
        <div className="appraise-time">{rev.appraise_time}</div>
      </div>
    </div>
  }

  loadPage(value) {
    let query = {
      member_id: this.props.member_id,
      page: value,
    };

    const { dispatch } = this.props;

    dispatch({
      type: "rating/getList",
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

  componentDidMount() {
    $('html').scrollTop(0);
    this.loadPage(1);
    this.addLoadBelowPage();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch({
      type: "rating/doRemoveAll",
    });
    $(window).off('touchmove');
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let {dispatch} = this.props;
    
    if (nextProps.getListRes) {
      var res = nextProps.getListRes;
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
        type: "rating/doRemoveAll",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.rating,
  };
})(FlxRating);