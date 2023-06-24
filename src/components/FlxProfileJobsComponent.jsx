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
  sanitizedContent,
} from '@/utils/utils';

class FlxProfileJobsComponent extends PageParent {
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

    return <div className="view jobs">
      <FlxPopup
        displayPopup={displaySureDelete}
        msg="是否确认删除需求？"
        confirm={this.delete.bind(this)}
        confirmText="删除"
        closePopup={this.toggleSureDelete.bind(this)}
        closeText="取消"
        />
      
      {data.map(this.eachJob.bind(this))}

      {(isEdit || (!isMe && (this.hash.direction === "demands" || this.hash.direction === "jobs" || (this.hash.direction === "services" && sessionStorage.logintoken)))) && <div className="space-lines2"/>}
      {isEdit && <div className="pfooter">
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

  eachJob(item, i) {
    let defaultHeadImg = require("@/img/flx7.png");
    let {
      isEdit,
    } = this.props;

    return <Link key={i} className={"entry job" + (isEdit && item.selected ? " selected" : "")} to={"/job/" + item.sd_id} onClick={this.onClick.bind(this, i)}>
      {isEdit && item.selected && <div className="select-mark"/>}

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
            <span className="date">{item.sd_released_time}</span>
          </div>
          <div className="address">{item.sd_c_contact_address}</div>
        </div>
      </div>
    </Link>
  }

  getSelectedIds() {
    let {
      data,
    } = this.state;

    let arr = data.filter(item => item.selected);
    arr = arr.map(item => item.sd_id);
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

  // publish() {
    // can't publish from here because it might cost money
  //   this.changeState(1);
  // }

  unpublish() {
    this.changeState(0);
  }

  delete() {
    this.toggleSureDelete();
    this.changeState(-1);
  }

  toggleSureDelete() {
    this.setState({displaySureDelete: !this.state.displaySureDelete});
  }

  changeState(state) {
    const { dispatch } = this.props;
    let successMessages = {
      // 1: "现场需求已上架",
      0: "现场需求已下架",
      "-1": "现场需求已删除",
    }
    this.setState({nextSuccess: successMessages[state]});

    dispatch({
      type: "profile/jobChangeState",
      payload: {sd_id: this.getSelectedIds(), sd_state: state},
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
      sd_member_id: this.props.member_id,
      page: value,
    };

    const { dispatch } = this.props;

    dispatch({
      type: "profile/jobList",
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

    if (nextProps.jobChangeStateRes && !this.props.jobChangeStateRes) {
      dispatch({
        type: "profile/doRemoveJobChangeStateRes",
      });
      if (nextProps.jobChangeStateRes.code === 1) {
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

    if (nextProps.jobListRes && !this.props.jobListRes) {
      let res = nextProps.jobListRes;
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
        type: "profile/doRemoveJobListRes",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.profile,
  };
})(FlxProfileJobsComponent);