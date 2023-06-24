import PageParent from '@/components/PageParent.jsx';
import { connect } from 'dva';
import { history, Link } from 'umi';
import { notification } from 'antd';
import Checkbox from '@/components/Checkbox.jsx';
import FlxPopup from '@/components/FlxPopup.jsx';
import FlxSelectAuthorComponent from '@/components/FlxSelectAuthorComponent.jsx';
import {
  hasVal,
  toArrayIfPossible,
} from '@/utils/utils';

class FlxProfileServicesComponent extends PageParent {
  render() {
    let {
      data = [],
      displaySureDelete,
    } = this.state;
    let {
      isEdit,
      isMe,
    } = this.props;
    let areSomeSelected = isEdit && this.getSelectedIds().length > 0;

    return <div className="view services">
      <FlxPopup
        displayPopup={displaySureDelete}
        msg="是否确认删除服务？"
        confirm={this.delete.bind(this)}
        confirmText="删除"
        closePopup={this.toggleSureDelete.bind(this)}
        closeText="取消"
        />
      
      {data.map(this.eachService.bind(this))}

      {(isEdit || (!isMe && (this.hash.direction === "demands" || this.hash.direction === "jobs" || (this.hash.direction === "services" && sessionStorage.logintoken)))) && <div className="space-lines2"/>}
      {isEdit && <div className="pfooter">
        <div className={"procedure" + (areSomeSelected ? "" : " white")} onClick={areSomeSelected ? this.publish.bind(this) : null}>
          上架
        </div> 
        <div className={"procedure" + (areSomeSelected ? "" : " white")} onClick={areSomeSelected ? this.unpublish.bind(this) : null}>
          下架
        </div> 
        <div className={"procedure" + (areSomeSelected ? "" : " white")} onClick={areSomeSelected ? this.toggleSureDelete.bind(this) : null}>
          删除
        </div> 
      </div>}
      {!isMe && (this.hash.direction === "demands" || this.hash.direction === "jobs") && <div className="pfooter">
        <div className="btn2 choose-this" onClick={this.chooseThis.bind(this)}>
          选择他下单
        </div>
      </div>}
      {!isMe && this.hash.direction === "services" && sessionStorage.logintoken && <div className="pfooter">
        <FlxSelectAuthorComponent
          proceed={this.chooseThisService.bind(this)}
          >

            <label className="btn2 choose-this" htmlFor="selectAuthor">
              选择他下单
            </label>
        </FlxSelectAuthorComponent>
      </div>}
    </div> 
  }

  constructor(props) {
    super(props);
    this.hash = props.match.params;

    this.state = {};
  }

  eachService(item, i) {
    //-1下架,0上架
    let {
      isEdit
    } = this.props;

    return <Link key={i} className={"entry" + (isEdit && item.selected ? " selected" : "")} to={"/service/" + item.s_id} onClick={this.onClick.bind(this, i)}>
      {isEdit && item.selected && <div className="select-mark"/>}
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
          <span className={"nickname" + (item.s_state == 1 ? " orange" : "")}>{item.s_state == 0 ? "上架" : "下架"}</span>
          <span className="city">{item.s_city}</span>
        </div>
      </div>
    </Link>
  }

  getSelectedIds() {
    let {
      data,
    } = this.state;

    let arr = data.filter(item => item.selected);
    arr = arr.map(item => item.s_id);
    return arr.join(",");
  }

  onClick(index, ev) {
    let {
      data,
    } = this.state;

    if (this.props.isEdit) {
      ev.preventDefault();
      data[index].selected = !data[index].selected;
      this.setState({data});
    }
  }

  publish() {
    this.changeState(0);
  }

  unpublish() {
    this.changeState(-1);
  }

  delete() {
    this.toggleSureDelete();
    this.changeState(-2);
  }

  toggleSureDelete() {
    this.setState({displaySureDelete: !this.state.displaySureDelete});
  }

  changeState(state) {
    const { dispatch } = this.props;
    let successMessages = {
      0: "服务已上架",
      "-1": "服务已下架",
      "-2": "服务已删除",
    }
    this.setState({nextSuccess: successMessages[state]});

    dispatch({
      type: "profile/serviceChangeState",
      payload: {s_id: this.getSelectedIds(), s_state: state},
    });
  }

  chooseThis() {
    if (sessionStorage.logintoken) {
      let {direction, itemId} = this.hash;
      if (direction === "demands") {
        sessionStorage.setItem("makeoffer", true);
        history.push("/demand/" + itemId);
      } else if (direction === "jobs") {
        history.push("/job/" + itemId);
      }
    } else {
      loginAndReturn();
    }
  }

  chooseThisService(ev) {
    if (ev.target.value || ev.target.value === 0) {
      let {itemId} = this.hash;
      sessionStorage.setItem("chosenUserType", ev.target.value);
      history.push("/service/" + itemId);
    }
  }

  loadPage(value) {
    let query = {
      s_member_id: this.props.member_id,
      page: value,
    };

    const { dispatch } = this.props;

    dispatch({
      type: "profile/serviceList",
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
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;

    if (nextProps.serviceChangeStateRes && !this.props.serviceChangeStateRes) {
      dispatch({
        type: "profile/doRemoveServiceChangeStateRes",
      });
      if (nextProps.serviceChangeStateRes.code === 1) {
        notification.success({
          className: "suc",
          message: this.state.nextSuccess || "---",
          duration: 2,
          onClose: () => {
            this.setState({nextSuccess: ""});
          }
        });

        if (this.state.page > 1) {
          $('html').scrollTop(0);
        }
        this.isLastPage = false;
        this.loadPage(1);
      }
    }

    if (nextProps.serviceListRes && !this.props.serviceListRes) {
      let res = nextProps.serviceListRes;
      if (res.code == 0) {
        this.isLastPage = true;
      } else if (!res.data || !res.data.data || !res.data.data.length || res.data.data.length === 0) {
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
        type: "profile/doRemoveServiceListRes",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.profile,
  };
})(FlxProfileServicesComponent);