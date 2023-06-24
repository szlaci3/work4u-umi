import React from 'react';
import { Link } from 'umi';
import { connect } from 'dva';
import {
  toArrayIfPossible,
} from '@/utils/utils';

class FlxIndexServicesComponent extends React.Component {
  render() {
    let {
      data = [],
    } = this.state;

    return <div className="view services">
      {data.map(this.eachService.bind(this))}
    </div> 
  }

  constructor() {
    super();
    this.state = {};
  }

  eachService(item, i) {
    return <Link key={i} className="entry" to={"/service/" + item.s_id}>
      <div className="img">
        <img src={cloud + item.s_title_pic}/>
      </div>
      <div className="text">
        <div className="title"><div>{item.s_title}</div></div>
        <div className="price">
          <span className="s">￥ </span>
          {item.s_cost}
          {item.s_cost && <span className="s">/元</span>}
        </div>
        <div className="lower">
          <span className="nickname">{item.s_member_name}</span>
          <span className="city">{item.s_city}</span>
          <span className="direction">服务</span>
        </div>
      </div>
    </Link>
  }

  loadPage(value) {
    const { dispatch } = this.props;

    dispatch({
      type: "index/serviceList",
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
    this.loadPage(1);
    this.addLoadBelowPage();
  }

  componentWillUnmount() {
    $(window).off('touchmove');
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;

    if (nextProps.serviceListRes) {
      let res = nextProps.serviceListRes;
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
        type: "index/doRemoveServiceListRes",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.index,
  };
})(FlxIndexServicesComponent);