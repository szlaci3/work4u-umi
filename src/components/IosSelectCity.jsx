import React from 'react';
import IosSelect from '@/lib/iosSelect.js';
import {iosProvinces, iosCitys, iosCountys} from '@/lib/iosSelect.areaData_v2.js';
import Zepto from '@/lib/iosSelect.zepto.js';
 
        // <label className="field">
        //   <div className="dlabel">联系地址</div>
        //   <IosSelectCity value={data.address} applySelection={this.setValue.bind(this, "address")} className="dvalue"/>
        //   <div className="go"/>
        // </label>
            // component will be shown when <label> is clicked.

// Must inline assets:
//   <link href="./css/iosSelect.css" rel="stylesheet" />

//   <script src="./lib/jquery-3.1.1.min.js"></script>
//   <script src="lib/iosSelect.zepto.js"></script>
//   <script src="lib/iosSelect.areaData_v2.js"></script>
//   <script src="lib/iosSelect.js"></script>

class IosSelectCity extends React.Component {
  render() {
    return <div className={"ios-select-city " + (this.props.className || "")} ref="childOfClickable">                 
        <div className="pc-box">                     
            <input type="hidden" name="contact_province_code" data-id="0001" ref="contact_province_code" value="" data-province-name=""/>                     
            <input type="hidden" name="contact_city_code" ref="contact_city_code" value="" data-city-name=""/><span ref="show_contact">{this.props.value}</span> 
        </div>             
    </div>
  }

  componentDidMount() {
    $('html').scrollTop(0);
    var that = this;
    var selectContactDom = $(this.refs.childOfClickable.parentElement);
    var showContactDom = $(this.refs.show_contact);
    var contactProvinceCodeDom = $(this.refs.contact_province_code);
    var contactCityCodeDom = $(this.refs.contact_city_code);
    selectContactDom.bind('click', function () {
        var sccode = showContactDom.attr('data-city-code');
        var scname = showContactDom.attr('data-city-name');

        var oneLevelId = showContactDom.attr('data-province-code');
        var twoLevelId = showContactDom.attr('data-city-code');
        var threeLevelId = showContactDom.attr('data-district-code');

        var iosSelect = new IosSelect(3, 
            [iosProvinces, iosCitys, iosCountys],
            {
                title: '地址选择',
                itemHeight: 35,
                relation: [1, 1],
                oneLevelId: oneLevelId,
                twoLevelId: twoLevelId,
                threeLevelId: threeLevelId,
                callback: function (selectOneObj, selectTwoObj, selectThreeObj) {
                    that.props.applySelection(selectOneObj.value + ' ' + selectTwoObj.value + ' ' + selectThreeObj.value);
                    contactProvinceCodeDom.val(selectOneObj.id); 
                    contactProvinceCodeDom.attr('data-province-name', selectOneObj.value);
                    contactCityCodeDom.val(selectTwoObj.id);
                    contactCityCodeDom.attr('data-city-name', selectTwoObj.value);

                    showContactDom.attr('data-province-code', selectOneObj.id);
                    showContactDom.attr('data-city-code', selectTwoObj.id);
                    showContactDom.attr('data-district-code', selectThreeObj.id);
                    showContactDom.html(selectOneObj.value + ' ' + selectTwoObj.value + ' ' + selectThreeObj.value);
                }
        });
    });

  }
};

export default IosSelectCity;
