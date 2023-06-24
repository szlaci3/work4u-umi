import React from 'react';
import FlxPopup from '@/components/FlxPopup.jsx';
import { history, Link } from 'umi';
import wx from 'jweixin-module';

// this file is better in ES5. #BIES5

// Two types:
      // Employer specifies address:
      // <FlxMapObject
      //   onSureClick={this.onSureClick.bind(this)}
      //   toggle={this.toggle.bind(this, "displayMap")}
      //   c_place={data.sdl_place}
      // />

      // Person checks in at an address. Add "target" to disable address input, map drag.
      // OnSureClick enabled within range.
      // <FlxMapObject
      //   onSureClick={this.onSureClick.bind(this)}
      //   toggle={this.toggle.bind(this, "displayMap")}
      //   range={200}
      //   target={data.rsd_place || "0,0"}
      //   c_place_name={data.rsd_place_name}
        
      // Wording params for both:
        // headLine="地址信息"
        // label="您定位信息…"
        // btnText="打 卡"
      // />

var isWechatBrowser = window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger';

class FlxMapObject extends React.Component {
  render() {
    var c_place_name = this.state.c_place_name;

    return <div className={navigator.platform.slice(0,7)}>
      <FlxPopup
        displayPopup={this.state.displayPleaseEnableMap}
        keepScrollEnabled={true}
        msg="打卡需要获取您的当前位置,请启动您的定位服务。"
        confirm={this.closePleaseEnableMap}
        confirmText="确认"
        />

      <div className="header">
        <div className="header-line shadow">
          <div className="h-left back-btn" onClick={this.props.toggle}/>

          <div className="h-middle">{this.props.headLine}</div>

          <Link className="h-home" to="/"/>
        </div>
      </div>
      <div className="space-lines1"/>

      <div className="addScheduling ruleSetup-position">
        <div className="ruleSetup-map permitted">
          <div id="map"></div>
          {isWechatBrowser && <div className="amap-controls">
            <div className={"flx-geolocation-con" + (this.state.loadingLocation ? " flx-locate-loading" : "")} onClick={this.wechatLocate}>
              <div className="flx-geo"></div>
            </div>
          </div>}

          {!!this.props.target && <div className="prevent-drag"/>}
        </div>
        <div className="ruleSetup-paragraph">
          <div id="ct_name_div" className="position-row-a">
            <label className="rule-title">{this.props.label}</label>
            <div className="map-input-wrapper">
              <div>
                <textarea id="c_place_name" className="goals c-place-name" value={c_place_name} onChange={this.handleGoalsChange} onKeyUp={this.handleGoalsKeyUp} disabled={!!this.props.target}/>
                <div id="goalsdiv" className="goals">{c_place_name}</div>
              </div>
            </div>
            <div className="origo"/>
          </div>
          
          <div className="limit-box">
            <button type="button" className="btn1" onClick={this.onSureClick} disabled={this.state.disableSubmit || this.props.target && !this.state.permitted}>{this.props.btnText}</button>
          </div>
        </div>
      </div>
    </div>
  }

  constructor (props) {
    super(props);
    this.handleGoalsChange = this.handleGoalsChange.bind(this);
    this.handleGoalsKeyUp = this.handleGoalsKeyUp.bind(this);
    this.onSureClick = this.onSureClick.bind(this);
    this.wechatLocate = this.wechatLocate.bind(this);
    this.complainDenial = this.complainDenial.bind(this);
    this.closePleaseEnableMap = this.closePleaseEnableMap.bind(this);

    this.state = {
      c_place: props.c_place,
      disableSubmit: !!props.target,
    }
  }

  componentDidMount() {
    $('html').scrollTop(0);
    this.createMap();
  }

  createMap() {
    var that = this;
    AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker) {
      var setting = {
        zoom: 16,
        scrollWheel: true,
        resizeEnable: true,
      };
      if (that.state.c_place) {
        setting.center = that.state.c_place.split(",");
      }
      that.map = new AMap.Map('map', setting);

      $('html, body').scrollTop(9999);

      if (isWechatBrowser) {
        wx.ready(function() {
          AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker) {
            that.map.plugin(['AMap.Geocoder'], function() {
              that.geocoder = new AMap.Geocoder({
                city: "010", //城市设为北京，默认：“全国”
                radius: that.props.range, //范围，默认：500
              });

              that.wechatLocate();
            });
            that.map.panBy(0, 1);
          });
        });
      } else {// no wechat browser
        that.map.plugin('AMap.Geolocation', function() {
          var location = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 2000,          //超过 x/1000 秒后停止定位，默认：无穷大
            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
            buttonPosition:'RB'
          });
          that.map.addControl(location);
          if (!that.state.c_place) {
            function success(res) {
              if (res === "complete"/* || !that.props.target*/) {
                that.setState({permitted: true});
              } else {
                that.complainDenial();
              }
            }

            location.getCurrentPosition(success);
          } else {
            that.setState({permitted: true});
          }
        });
      }

      var autoOptions = {
        input: "c_place_name"
      };
      var auto = new AMap.Autocomplete(autoOptions);
      var placeSearch = new AMap.PlaceSearch({
        map: that.map
      });  //构造地点查询类
      AMap.event.addListener(auto, "select", select);//注册监听，当选中某条记录时会触发|Select from list
      function select(e) {
        placeSearch.setCity(e.poi.adcode);
        placeSearch.search(e.poi.name);  //关键字查询查询
      }

      var positionPicker = new PositionPicker({
        mode: 'dragMap',
        map: that.map
      });

      positionPicker.on('success', function(positionResult) {
        var position = positionResult.position;
        // var c_place = position.O+","+position.Q; // before 2020
        // var c_place = position.Q+","+position.P; // during 2020
        var c_place = position.lng+","+position.lat; // alternative that can be used forever?
        var target = that.props.target;

        if (target) {
          var disableSubmit = true;
          var lnglat = new AMap.LngLat(position.lng, position.lat);
          if (lnglat.distance(target.split(",")) <= that.props.range) {
            disableSubmit = false;
          }

          that.setState({disableSubmit: disableSubmit, c_place: c_place, c_place_name: that.props.c_place_name}, that.handleGoalsKeyUp.bind(that, {}));
        } else {
          that.setState({c_place: c_place, c_place_name: positionResult.address}, that.handleGoalsKeyUp.bind(that, {}));
        }
      });
      positionPicker.on('fail', function(positionResult) {
        that.setState({c_place: "", c_place_name: ""});
      });
      positionPicker.start();

      if (that.props.target) {
        var circle = new AMap.Circle({
          center: new AMap.LngLat(that.props.target.split(",")[0], that.props.target.split(",")[1]),
          radius: that.props.range, //半径
          strokeColor: "#14950e", //线颜色
          strokeOpacity: 1, //线透明度
          strokeWeight: 3, //线粗细度
          fillColor: "#1ec716", //填充颜色
          fillOpacity: 0.35//填充透明度
        });
        circle.setMap(that.map);
        var smallCircle = new AMap.Circle({
          center: new AMap.LngLat(that.props.target.split(",")[0], that.props.target.split(",")[1]),
          radius: 8,
          strokeColor: "#fff",
          strokeWeight: 3,
          strokeOpacity: .8,
          fillColor: "#14950e",
          fillOpacity: 0.5
        });
        smallCircle.setMap(that.map);
      }

      that.map.panBy(0, 1);
    });
  }

  handleGoalsChange(ev) {
    if (ev.target.value.length <= 400) {
      this.setState({c_place_name: ev.target.value});
    }
  }

  handleGoalsKeyUp(ev) {
    let height = $("#goalsdiv").height();
    height = Math.min(96, height + (ev.key === "Enter" ? 18 : 0));
    $("#c_place_name").height(height);
  }

  onSureClick() {
    var c_place = this.state.c_place;
    var c_place_name = this.state.c_place_name;
    var shi = c_place_name.indexOf("市");
    var province, city;
    if (shi !== -1) {
      var provinceAndCity = c_place_name.slice(0, shi + 1);
      switch (provinceAndCity) {
        case "北京市":
        case "天津市":
        case "上海市":
        case "重庆市":
          province = city = provinceAndCity; break;
        default: {
          var sheng = provinceAndCity.indexOf("省");
          if (sheng !== -1) {
            province = provinceAndCity.slice(0, sheng + 1);
            city = provinceAndCity.slice(sheng + 1);
          }
        }
      }
    }

    var signPositionData = {
      c_place:c_place,
      c_place_name:c_place_name,
      sdl_city: (province || "") + " " + (city || ""),
    }
    this.props.onSureClick(signPositionData);
  }

  wechatLocate() {
    let that = this;
    this.setState({loadingLocation: true});
    wx.getLocation({
      type: 'gcj02', // The default is the GPS coordinates of wgs84. If you want to return the Martian coordinates used directly to openLocation, you can pass in 'gcj02' 
      success: function (res) {
        console.log(res)
        const latitude = res.latitude; // Latitude, floating point number, the range is 90 ~ -90 
        const longitude = res.longitude; // Longitude, floating point number, the range is 180 ~ -180.
        that.setState({permitted: true});

        if (!that.marker) {
          that.marker = new AMap.Marker();
          that.map.add(that.marker);
        }
        that.marker.setPosition([longitude,latitude]);
        // that.map.setFitView(that.marker);

        that.geocoder.getAddress([longitude,latitude], function(status, result) {
          var target = that.props.target;
          if (status === 'complete' && result.info === 'OK') {
            var c_place = longitude+","+latitude;
            if (!that.props.c_place || that.state.enableWechatReGeolocate) {
              // enableWechatReGeolocate: At first load show c_place || myLocation. Click wechatLocate must show myLocation
              that.map.panTo([longitude,latitude]);
            }

            if (target) {
              var disableSubmit = true;
              var lnglat = new AMap.LngLat(longitude, latitude);
              if (lnglat.distance(target.split(",")) <= that.props.range) {
                disableSubmit = false;
              }

              that.setState({loadingLocation: false, enableWechatReGeolocate: true, disableSubmit: disableSubmit, c_place: c_place, c_place_name: that.props.c_place_name}, that.handleGoalsKeyUp.bind(that, {}));
            } else {
              that.setState({loadingLocation: false, enableWechatReGeolocate: true, c_place: c_place, c_place_name: result.regeocode.formattedAddress}, that.handleGoalsKeyUp.bind(that, {}));
            }
          }else{
            that.setState({loadingLocation: false, enableWechatReGeolocate: true, errorMsg:"地址获取失败！请重新获取！", c_place: "", c_place_name: ""});
          }
        });
      },
      fail:function(err){
        // if (that.props.target) {
          that.complainDenial();
        // }
        that.setState({loadingLocation: false, enableWechatReGeolocate: true, c_place: "", c_place_name: "", permitted: that.props.target ? false : true});
        console.log ( 'WeChat call failed' );
        console.log(err);
      }
    });
  }

  complainDenial() {
    this.setState({permitted: false, displayPleaseEnableMap: true});
  }

  closePleaseEnableMap() {
    this.setState({displayPleaseEnableMap: false});
  }
}

export default FlxMapObject;