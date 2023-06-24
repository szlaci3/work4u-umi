import PageParent from '@/components/PageParent.jsx';
import { connect } from 'dva';
import { notification } from 'antd';
import { history, Link } from 'umi';
import {
  toArrayIfPossible,
  isIOS,
  hasVal,
} from '@/utils/utils';



class FlxSystemInfoList extends PageParent {
  render() {
    let {
      data = [],
      all = "",
      not_read,
    } = this.state;

    return <div className="view system">
      <div>
        <span className="tbold">{"系统信息（" + all + "）"}</span>
        <span className="tunread">
          {hasVal(not_read) && (not_read + "条未读")}
        </span>
      </div>

      <div className={this.isLastPage ? "tlast-page" : "tnot-last"}>
        {data.map(this.eachMsg.bind(this))}
      </div> 
    </div> 
  }

  constructor() {
    super();
    this.state = {};
  }

  eachMsg(item, i) {
    return <Link key={i} className={"tcontact" + (item.msg_read == 0 ? " unread" : "")} to={"/msg/" + item.msg_id}>

      <div className="tname">{item.msg_title}</div>
      <span className="tdate">{item.msg_send_time}</span>
      <div className="tdescription">{item.msg_con}</div>
    </Link>
  }

  loadPage(value) {
    let query = {
      page: value,
    };

    const { dispatch } = this.props;

    dispatch({
      type: "systemInfoList/getList",
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
    $(window).off('touchmove');
    const { dispatch } = this.props;

    dispatch({
      type: "systemInfoList/doRemoveAll",
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let {dispatch} = this.props;
    
    if (nextProps.listRes) {
      let res = nextProps.listRes;
      if (res.code == 0) {
        this.isLastPage = true;
        notification.warn({
          className: "erm",
          message: res.msg,
          duration: 0,
        });
      } else if (res.data.data.length === 0) {
        // in FLX Lists, empty results is code 1, data.data [].
        this.isLastPage = true;
        if (res.data.current_page == 1) {
          this.setState({data: []});
        }
        this.setState({page: res.data.current_page, all: res.data.all, not_read: res.data.not_read});
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

        this.setState({data: data, page: res.data.current_page, all: res.data.all, not_read: res.data.not_read});
      }
      this.isLoadingMore = false;

      dispatch({
        type: "systemInfoList/doRemoveAll",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.systemInfoList,
  };
})(FlxSystemInfoList);