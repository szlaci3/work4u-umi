import PageParent from '@/components/PageParent.jsx';
import { Link } from 'umi';
import { connect } from 'dva';
import { notification } from 'antd';
import {
  hasVal,
  toArrayIfPossible,
} from '@/utils/utils';

class FlxCollectionDemandsComponent extends PageParent {
  render() {
    let {
      data = [],
    } = this.state;

    return <div className="view demands">
      {data.map(this.eachDemand.bind(this))}
    </div> 
  }

  constructor(props) {
    super(props);
    this.loadList = this.loadList.bind(this);
    this.demandStates = {
      "-2": "已删除",
      "-1": "已下架",
      0: "匹配中",
      1: "已报价",
      2: "已下单"
    }

    this.state = {search: props.search};
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
          <span className="nickname">{item.member_nickname}</span>
          <span className="city">{this.demandStates[item.d_state]}</span>
          <span className="direction">需求</span>
        </div>
      </div>
    </Link>
  }

  loadList(novelty, value) {
    let query = {
      collect_type: 0,
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
      type: "collection/demandList",
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
    
    if (nextProps.demandListRes && !this.props.demandListRes) {
      let res = nextProps.demandListRes;
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
        type: "collection/doRemoveDemandListRes",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.collection,
  };
})(FlxCollectionDemandsComponent);