import React from 'react';
import { Link } from 'umi';
import { connect } from 'dva';
import { notification } from 'antd';
import {
  hasVal,
  toArrayIfPossible,
} from '@/utils/utils';

class FlxCollectionServicesComponent extends React.Component {
  render() {
    let {
      data = [],
    } = this.state;

    return <div className="view services">
      {data.map(this.eachService.bind(this))}
    </div> 
  }

  constructor(props) {
    super(props);
    this.loadList = this.loadList.bind(this);

    this.state = {search: props.search};
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
          <span className="nickname">{item.member_nickname}</span>
          <span className="city">{item.s_city}</span>
          <span className="direction">服务</span>
        </div>
      </div>
    </Link>
  }

  loadList(novelty, value) {
    let query = {
      collect_type: 1,
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
      type: "collection/serviceList",
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
    
    if (nextProps.serviceListRes && !this.props.serviceListRes) {
      let res = nextProps.serviceListRes;
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
        type: "collection/doRemoveServiceListRes",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.collection,
  };
})(FlxCollectionServicesComponent);