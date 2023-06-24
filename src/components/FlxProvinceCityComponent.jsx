import React from 'react';
import { connect } from 'dva';
import {
  isIOS,
} from '@/utils/utils';

        // <FlxProvinceCityComponent
          // paramName="member_native_place"
          // labelText="籍贯"
          // togetherValue={data.member_native_place}
          // setValue={this.setValue.bind(this)}
        // />

class FlxProvinceCityComponent extends React.Component {
  render() {
    let {provinces, cities, province = {}, city = {}} = this.state;
    let {props} = this;

    return <label className="field tandem">
      <div className="part part1">
        <div className="dlabel">{props.labelText + " 省份"}</div>
        <select className={"dvalue" + (province.value ? "" : " placeholder-color")} value={province.key || ""} name="province" onChange={this.handleProvinceChange.bind(this)}>
          <option value="" hidden disabled>请选择</option>
          {provinces && provinces.map(this.eachAddressOption)}
        </select>
      </div>
      <div className="part">
        <div className="dlabel">城市</div>
        <select className="dvalue" value={city.key || ""} name="city" onChange={this.handleCityChange.bind(this)} disabled={!province.value || !cities || !cities[0]}>
          <option value="" hidden disabled></option>
          {cities && cities.map(this.eachAddressOption)}
        </select>
      </div>
      {isIOS && <div className="go "/>}
    </label>
  }

  constructor(props) {
    super(props);
    let twoParts = [];
    if (props.togetherValue) {
      twoParts = props.togetherValue.split(" ");
    }

    this.state = {twoParts};
  }

  /* option = {key: "1231232", value: "上海"};*/
  eachAddressOption(option, i) {
    return <option key={i} value={option.key}>{option.value}</option>
  }

  handleProvinceChange(ev) {
    let {props} = this;
    let targetValue = ev.target.value;
    let text = ev.target.selectedOptions[0].text;
    this.setState({province: {key: targetValue, value: text}, city: {}, cities: [], hasProvinceChanged: true});
    // hasProvinceChanged: province is not the same as when page was loaded, so use cities[0] at cityRes from now on
    this.getLocalities({key: targetValue, value: text});
  }

  handleCityChange(ev) {
    let {province} = this.state;
    let {props} = this;

    props.setValue(props.paramName, province.value + " " + ev.target.selectedOptions[0].text, false);
    this.setState({city: {key: ev.target.value, value: ev.target.selectedOptions[0].text}});
  }

  makeCitiesArray(response_cities) {
    let cities = [];
    for (let i in response_cities) {
      cities.push({key: i, value: response_cities[i]});
    };
    return cities;
  }

  getLocalities(levelObj) {
    /* using only two of three levels, no need for district */

    const { dispatch, paramName } = this.props;
    let query = {province_key: levelObj.key, city_key: 1};

    if (paramName === "member_work_city") {
      // second instance needs second state.provinceCity.cityRes
      dispatch({
        type: "provinceCity/getWorkCities",
        payload: query,
      });
    } else {
      dispatch({
        type: "provinceCity/getCities",
        payload: query,
      });
    }
  }

  componentDidMount() {
    $('html').scrollTop(0);
    let {props} = this;
    const { dispatch } = this.props;

    if (!props.provincesRes) {
      dispatch({
        type: "global/getProvinces",
      });
    } else {
      this.provinceCallback(props.provincesRes);
    }
  }

  provinceCallback(response) {
    let provinces = [];
    let selectedProvinceKey = 0;
    let {twoParts} = this.state;
    for (let i in response.province) {
      provinces.push({key: i, value: response.province[i]});
      /* get the selected province if any */
      if (twoParts[0] && twoParts[0] === response.province[i]) {
        selectedProvinceKey = i;
      }
    };

    this.setState({
      provinces,
      province: selectedProvinceKey > 0 ? {key: selectedProvinceKey, value: response.province[selectedProvinceKey]} : {}
    });
    if (selectedProvinceKey > 0) {
      this.getLocalities({key: selectedProvinceKey, value: response.province[selectedProvinceKey]}, this.cityCallback.bind(this));
      return;
    } else {
      this.setState({
        cities: this.makeCitiesArray(response.city),
        city: {},
      });
    }
  }

  cityCallback(response) {
    let cities = [];
    let selectedCityKey = 1;
    let {twoParts} = this.state;
    for (let i in response.city) {
      cities.push({key: i, value: response.city[i]});
      /* get the selected province if any */
      if (!this.state.hasProvinceChanged && twoParts[1] && twoParts[1] === response.city[i]) {
        selectedCityKey = i;
      }
    };
    this.props.setValue(this.props.paramName, this.state.province.value + " " + response.city[selectedCityKey], !this.state.hasProvinceChanged);// isSilent Bool
    this.setState({
      cities,
      city: {key: selectedCityKey, value: response.city[selectedCityKey]},
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch({
      type: "provinceCity/doRemoveAll",
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let {dispatch} = this.props;
    
    if (nextProps.provincesRes && !this.props.provincesRes) {
      this.provinceCallback(nextProps.provincesRes);
    }

    if (this.props.paramName === "member_work_city" && nextProps.workCitiesRes) {
      this.setState({
        cities: this.makeCitiesArray(nextProps.workCitiesRes.city)
      });
      this.cityCallback(nextProps.workCitiesRes);

      dispatch({
        type: "provinceCity/doRemoveAll",
      });
    }

    if (this.props.paramName !== "member_work_city" && nextProps.citiesRes) {
      this.setState({
        cities: this.makeCitiesArray(nextProps.citiesRes.city)
      });
      this.cityCallback(nextProps.citiesRes);

      dispatch({
        type: "provinceCity/doRemoveAll",
      });
    }
  }
};

export default connect(state => {
  return {
    ...state.provinceCity,
    provincesRes: state.global.provincesRes,
  };
})(FlxProvinceCityComponent);