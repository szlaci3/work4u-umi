import React from 'react';
import wx from 'jweixin-module';

      // <FlxMapPermit
      //   range={200}
      //   target={data.rsd_place || "0,0"}
      //   c_place_name={data.sdl_address}
      // />}


      // see more: FlxMapPermit params and setup



var isWechatBrowser = window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger';

class FlxMapPermit extends React.Component {
  render() {
    return <div id="map0"/>
  }

  loadForjs() {
    var url=location.href;
    $.ajax({
      type: 'post',
      url: hrFocusUrl + "/index/index/forjs",
      dataType: "json",
      async: true,
      data: {url: url},
      success: function(c) {
        wx.config({
          beta: true,

          appId: c.appId,
          timestamp: c.timestamp,
          nonceStr: c.nonceStr,
          signature: c.signature,
          jsApiList: c.jsApiList,
        });
      },
      error: function(data) {
        console.log("连接失败！");
      }
    });
  }

  componentDidMount() {
    $('html').scrollTop(0);
    var that = this;
    AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker) {
      that.map = new AMap.Map('map0');

      if (isWechatBrowser) {
        that.loadForjs();
        wx.ready(function() {
          AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker) {
            that.map.plugin(['AMap.Geocoder'], function() {
              that.geocoder = new AMap.Geocoder({
                city: "010",
                radius: 200,
              });
              wx.getLocation({
                type: 'gcj02',
                success: function (res) {
                  that.props.that.setState({mapPermit: true});
                },
                fail:function(err){
                  that.props.that.setState({mapPermit: !that.props.target});
                },
              });
            });
          });
        });
      } else {// no wechat browser
        that.map.plugin('AMap.Geolocation', function() {
          var location = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 2000,          
            buttonOffset: new AMap.Pixel(10, 20),
            zoomToAccuracy: true,      
            buttonPosition:'RB'
          });
          function success(res) {
            if (res === "complete" || !that.props.target) {
              that.props.that.setState({mapPermit: true});
            } else {
              that.props.that.setState({mapPermit: false});
            }
          }

          location.getCurrentPosition(success);
        });
      }
    })
  }
}

export default FlxMapPermit;