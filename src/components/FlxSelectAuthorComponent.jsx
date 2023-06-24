import React from 'react';
import { connect } from 'dva';
import {
  isIOS,
} from '@/utils/utils';


/*
<FlxSelectAuthorComponent
    proceed={this.makeOffer.bind(this)}
    disabled={!canMakeOffer}
  >
    <div className={"make-offer" + (canMakeOffer ? "" : " disabled")} >我要下单</div>
</FlxSelectAuthorComponent>  
*/

class FlxSelectAuthorComponent extends React.Component {
  render() {
    let {users} = this.state;

    if (this.state.hasError) {
      return <span className="select-author-wrapper">
        {this.props.children}
      </span>

    } else if (users && users.length === 1) {
      return <span className="select-author-wrapper" onClick={!this.props.disabled && this.props.proceed.bind(null, {target: {value: users[0].d_user_type}})/*if only user, proceed directly*/}>
        
        {this.props.children}
      </span>

    } else {
      return <span className="select-author-wrapper">
        <select className="select-author" onChange={this.props.proceed} disabled={this.props.disabled}>
            <option value="" hidden={isIOS} disabled={isIOS}></option>
            {users && users.map(this.eachUser.bind(this))}
        </select>

        {this.props.children}
      </span>
    }
  }

  constructor(props) {
    super(props);

    this.state = {};
  }

  eachUser(user, i) {
    return <option key={i} value={user.d_user_type}>
      {user.name}
    </option>
  }

  getUserName() {
    if (this.props.getUserNameRes) {
      let res = this.props.getUserNameRes;
      this.setState({users: res.data});
    } else {
      const { dispatch } = this.props;
      dispatch({
        type: "selectAuthor/getUserName",
      });
    }
  }

  componentDidMount() {
    $('html').scrollTop(0);
    if (sessionStorage.logintoken) {
      this.getUserName();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.getUserNameRes) {
      let res = nextProps.getUserNameRes;
      if (res.code == 0) {
        this.setState({hasError: true});
      } else {
        this.setState({users: res.data});
      }
    }
  }
};

export default connect(state => {
  return {
    ...state.selectAuthor,
  };
})(FlxSelectAuthorComponent);