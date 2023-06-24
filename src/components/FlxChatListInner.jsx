import PageParent from '@/components/PageParent.jsx';
import { connect } from 'dva';
import { history, Link } from 'umi';
import {
  toArrayIfPossible,
  isIOS,
  hasVal,
} from '@/utils/utils';

class FlxChatListInner extends PageParent {
  render() {
    let {
      data = [],
      all = "",
      not_read,
    } = this.state;

    return <div className="view chatlist">
      <div>
        <span className="tbold">{"聊天通知（" + all + "）"}</span>
        <span className="tunread">
          {hasVal(not_read) && (not_read + "条未读")}
        </span>
      </div>

      <div>
        {data.map(this.eachMsg.bind(this))}
      </div> 
    </div> 
  }

  constructor() {
    super();
    this.state = {};
  }

  eachMsg(item, i) {
    let con = JSON.parse(item.chat_con);
    let defaultHeadImg = require("@/img/flx7.png");
    let desc;
    if (con.txt) {
      desc = con.txt.substr(0, 2) === "/:" ? "表情" : con.txt;
      // /: (emoji)
    } else {
      switch (con.filetype) {
        case 'pdf': ;
        case 'doc': ;
        case 'docx': ;
        case 'xls': ;
        case 'xlsx': desc = '文件'; break;
        case 'jpeg': ;
        case 'jpg': ;
        case 'png': ;
        case 'gif': ;
        case 'bmp': desc = '图片';
      }
    }

    return <Link key={i} className="tcontact" to={"/chat/" + item.other_id}>
      <div className="img">
        <img src={hasVal(item.member_profile) ? (cloud + item.member_profile) : null} onError={(ev) => {ev.target.src = defaultHeadImg}}/>
      </div>
      <div className="ttext">
        {item.no_reading > 0 && <div className="tbullet"/>}
        <div className="tname">{item.member_nickname}</div>
        <span className="tdate">{item.chat_send_time || ""}</span>
        <div className="tdescription">{desc}</div>
      </div>
    </Link>
  }

  loadData() {
    // it has no "page" param
    const { dispatch } = this.props;

    dispatch({
      type: "chatListInner/getChatList",
    });
  }

  componentDidMount() {
    $('html').scrollTop(0);
    this.loadData();

    // go to new page, click back: reload old page to update data 
    window.addEventListener("pageshow", function(evt) {
      if(evt.persisted) {
        document.body.innerHTML = '';
        setTimeout(function() {
          window.location.reload();
        }, 10);
      }
    }, false);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch({
      type: "chatListInner/doRemoveAll",
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let {dispatch} = this.props;
    
    if (nextProps.chatListRes) {
      let res = nextProps.chatListRes;
      let all = res.data.all;
      let not_read = res.data.not_read;
      delete res.data.all;
      delete res.data.not_read;
      let data = toArrayIfPossible(res.data);
      if (!$.isArray(data)) {
        data = [];
      }
      this.setState({data, all, not_read});

      dispatch({
        type: "chatListInner/doRemoveAll",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.chatListInner,
  };
})(FlxChatListInner);