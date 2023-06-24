import PageParent from '@/components/PageParent.jsx';
import { connect } from 'dva';
import { history, Link } from 'umi';
import { notification } from 'antd';
import {
  toArrayIfPossible,
  isIOS,
  hasVal,
} from '@/utils/utils';
import Qiniu from 'react-qiniu-2.0';
import Floader from '@/components/Floader.jsx';


class FlxContent extends PageParent {
  render() {
    let {
      data = {},
      images,
      dataCanSubmit,
      selectedIndex,
    } = this.state;

    return <div className="gcontent bg-f4">
      {!dataCanSubmit && <div className="nactions-fog"/>}

      <div className="header">
        <div className="header-line">
          <div className="h-left back-btn" onClick={this.props.toggleContent} />

          <div className="h-middle">详细描述</div>

          <Link className="h-home" to="/"/>
        </div>
      </div>
      <div className="space-lines1"/>

      {hasVal(selectedIndex) && (
        <div className="zoomed">
          <div className="x-white" onClick={this.zoomOut.bind(this)}>
            <img src={require("@/img/x-white.png")}/>
          </div>
          <div className="img">
            <img src={cloud + images[selectedIndex].filename} alt=""/>
          </div>

          <div className="koperations">
            <div>
              <div className="kreplace" onClick={this.replaceFile.bind(this)}>
                重新上传
              </div>
              <div className="kdelete" onClick={this.deleteFile.bind(this)}>
                删除图片
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="inner">
        <div className="con-wrapper">
          <textarea name="con" value={this.htmlDecode(data.con)} onChange={this.handleChange.bind(this)} placeholder={"Please fill in您的" + (this.props.isService ? "服务…" : "需求…")}/>
        </div>

        <div className="thumbnails">
          {images && images[0] && images[0].filename !== "" && images.map(this.eachImage.bind(this))}
          {!images || images.length < 9 && (
            <Qiniu ref="fileInput" className="qiniu-box join-document-image" style={{}} token={this.props.token || ""} onDrop={this.onDrop.bind(this)} multiple={true}>

              <div className="painting"/>
            </Qiniu>
          )}
        </div>
        <Qiniu ref="fileReplace" className="visibility-hidden" style={{}} token={this.props.token || ""} onDrop={this.onDrop.bind(this)} multiple={false}/>

        <div className="limit-box near-down">
          <button type="button" className="btn1 btn-high" onClick={this.props.applyContent.bind(null, data, images)} disabled={!dataCanSubmit}>提 交</button>
        </div>

      </div>
    </div> 
  }

  constructor(props) {
    super();
    this.countFiles = props.images ? props.images.length : 0;
    let images = props.images && props.images.filter ? props.images.filter(item => item) : [];

    this.state = {data: {con: props.con}, images, dataCanSubmit: true};
  }

  eachImage(file, i) {
    return <span className="join-document-image" key={file.preview || file.filename}>
      <div className="gimage">
        <img src={file.preview || cloud + file.filename} alt="" onClick={this.zoomIn.bind(this, i)}/>
      </div>

      {file.preview && !file.filename && <Floader/>}
    </span>
  }

  swipe(direction) {
    let {selectedIndex} = this.state;
    if (hasVal(selectedIndex)) {
      selectedIndex = selectedIndex + direction;
      if (selectedIndex < 0) {
        selectedIndex = this.countFiles - 1;
      } else if (selectedIndex >= this.countFiles) {
        selectedIndex = 0;
      }
      this.setState({selectedIndex});
    }
  }

  zoomIn(selectedIndex) {
    this.scrolled = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop || 0;
    $('body').addClass("fixed-body").css({marginTop: - this.scrolled});
    this.setState({selectedIndex});
  }

  zoomOut() {
    $('body').removeClass("fixed-body").css({marginTop: 0});
    $('html').scrollTop(this.scrolled);
    this.setState({selectedIndex: null});
  }

  handleChange(ev) {
    let {data} = this.state;
    data[ev.target.name] = ev.target.value;
    this.setState({data});
  }

  onDrop(files) {
    // variable "key" changed into "filename"
    let {images, selectedIndex} = this.state;
    let myFiles;
    if (hasVal(selectedIndex)) {
      myFiles = images.map(item => item); // clone. Dont affect state if error.
      myFiles[selectedIndex] = files[0];
      this.zoomOut();
    } else {
      myFiles = images.concat(files).slice(0, 9);
    }
    // when upload response will come, add the file location to the existing files in state. The variable i is in the bind and it is taking care which key belongs to which file.
    for (let i = 0; i<myFiles.length; i++) {
      if (!myFiles[i].filename) {
    
        if (myFiles[i].size > 5242880) {
          notification.warn({
            className: "erm",
            message: "很抱歉，文件大小不能超过5MB哦~",
            duration: 0,
          });
          return;
        }
        if (myFiles[i].type !== "image/jpg" && myFiles[i].type !== "image/jpeg" && myFiles[i].type !== "image/png" && myFiles[i].type !== "image/gif" && myFiles[i].type !== "image/bmp") {
          
          notification.warn({
            className: "erm",
            message: "您上传的文件类型有误，请上传JPG、GIF、PNG、BMP格式的文件~",
            duration: 0,
          });
          return;
        }

        myFiles[i].uploadPromise.done(function(i, res) {
          let {images} = this.state;
          images[i].filename = res.body.name && res.body.name.key || res.body.filename;

          this.setState({images});
          if (!hasVal(selectedIndex)) {
            this.countFiles++;
          }
          if (this.countFiles === myFiles.length || i === selectedIndex) {
            this.setState({dataCanSubmit: true});
          }
        }.bind(this, i));
      }
    }
    images = myFiles;
    this.setState({images, dataCanSubmit: false});
  }

  deleteFile() {
    let {images, selectedIndex} = this.state;
    images.splice(selectedIndex, 1);
    this.countFiles--;

    if (images.length > 0) {
      selectedIndex = Math.min(selectedIndex, images.length - 1);
    } else {
      selectedIndex = null;
      this.zoomOut();
    }
    this.setState({images, selectedIndex});
  }

  replaceFile() {
    this.refs.fileReplace.onClick();
  }

  componentDidMount() {
    $('html').scrollTop(0);
    $("body").swiperight(this.swipe.bind(this, -1));
    $("body").swipeleft(this.swipe.bind(this, 1));
  }
};

export default FlxContent;