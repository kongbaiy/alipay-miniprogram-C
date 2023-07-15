
const app = getApp();
const appData = app.data;
const api = app.api;

Page({
  data: {
    weatherinfo: '',
    serviceList: [],
    activeServiceNavIndex: 0,
    userInfo: {},
    userDefaultAvatar: appData.userDefaultAvatar
  },
  onLoad(query) {
    this.weather();
    this.getCheckSession();
    this.getServiceList({
      miniProgramsType: "支付宝小程序",
      districtAdcode: '510100'
    });
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    // 页面显示
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    };
  },

  onUserInfo() {
    my.navigateTo({
      url: '/pages/personal-center/personal-center'
    });
  },

  onSearch() {
     my.navigateTo({
      url: '/pages/search/search'
    });
  },

  onLogin() {
    this.regOrLogin();
  },

  onServiceNav(e) {
    const { dataset } = e.target;

    this.setData({
      activeServiceNavIndex: dataset.index
    });
  },

  onNavigateToPage(e) {
    const { item, path } = e.target.dataset;
    
    if (item.redirectType == 1) {
       my.navigateTo({
        url: `/pages/webview/webview?url=${path}`
      });
    } else {
      my.ap.navigateToAlipayPage({
        path,
        fail(error) {
          my.alert({ 
            content: '失败：' + JSON.stringify(error) 
          });
        }
      });
    }
  },

  weather() {
    api.weather({
      success: (res) => {
        const { data } = res;

        if (data.code == 1) {
          let str = "";
          
          if (data.result && data.result.weather) {
            str =
              data.result.weather +
              " " +
              data.result.minTemp +
              "℃~" +
              data.result.maxTemp +
              "℃";
          }
          this.setData({
            weatherinfo: str
          });
        }
      }
    });
  },

  /**
   * 获取服务列表
   * @param {object} params
   * @param {string} miniProgramsType
   * @param {string} districtAdcode
   * */
  getServiceList(params = {}) {
    my.showLoading({
      content: '加载中...',
      delay: 3000
    });
    api.serviceList({
      data: params,
      success: (res) => {
        const { data } = res;
        my.hideLoading();

        if (data.code == 1) {
          const { info, serviceinfo } = data.result; 
          const d = new Date();
          const year = d.getFullYear();
          const month = d.getMonth() + 1;
          const date = d.getDate();
          
          // 判断资讯是否有新服务
          info.forEach(item => {
            if (year.toString() > item.create_time || (year + '-' + month) > item.create_time) {
              return false;
            }

            let item_date = item.create_time.split('-')[2];
            if (date - item_date <= 7) {
              item.is_new_service = true;
            }
          });

          // 常用服务分类
          const service = [];
          let type;
          for(let i = 0;i < serviceinfo.length; i++) {
            let check = service.some(item => item.type === serviceinfo[i].type);

            if (type !== serviceinfo[i].type && !check) {
              type = serviceinfo[i].type;
              service.push({
                type,
                data: serviceinfo.filter(item => item.type === type)
              });
            }
          }
          data.result.newServiceInfo = service;
          appData.serviceList = data.result;
          this.setData({
            serviceList: data.result
          });
        } else {
          my.showToast({
            type: 'none',
            content: res.msg || '服务列表查询出错',
            duration: 3000
          });
        }
      }
    });
  },

  /**
   * @param {string} code 支付宝授权码
   * @param {string} sessionKey
   * */
  regOrLogin() {
    const _this = this;

    my.showLoading({
      content: '登录中...',
      delay: 3000
    });
    my.getAuthCode({
      scopes: 'auth_user',
      success(authRes) {
        const public_key_data = JSON.parse(my.getStorageSync({ key: 'public_key_data' }).data) || '';

        _this.getPublicKey(public_key_data, (publicKeyRes) => {
          let random_code = app.smyCrypto.random_code(true, 16, 16);
          let public_key = appData.public_key;
          let expire_time = publicKeyRes.expire_time;

          api.regOrLogin({
            data: {
              data: app.smyCrypto.rsa_encrypt(JSON.stringify({ aes_key: random_code }), public_key),
              content: app.smyCrypto.aes_encrypt(JSON.stringify({ code: authRes.authCode }), random_code),
              expire_time: expire_time
            },
            success(res) {
              my.hideLoading();

              if (res.data.success == 200) {
                let res_data = app.smyCrypto.aes_decrypt(res.data.data, random_code);
                let user_info = JSON.parse(res_data || '{}').data || {};
               
                if (user_info.needBind) {
                  return false;
                }
                my.getAuthUserInfo({
                  success(res) {
                    let auth_user_info = {
                      ...user_info,
                      ...res,
                    }
                    
                    _this.setData({
                      userInfo: auth_user_info
                    });
                    my.setStorageSync({
                      key: 'userInfo',
                      data: auth_user_info
                    });
                  }
                });
              }
            },
            fail() {
              my.showToast({
                type: 'none',
                content: '登录失败，请稍后再试！',
                duration: 3000
              });
            }
          });
        });
      }
    });
  },

  /**
   * 检查session
   * @param {string} sessionkey
   * */ 
  getCheckSession() {
    const _this = this;
    const public_key_data = JSON.parse(my.getStorageSync({ key: 'public_key_data' }).data) || '';
    const userInfo = my.getStorageSync({ key: 'userInfo'}).data || {};

    _this.getPublicKey(public_key_data, (publicKeyRes) => {
      let random_code = app.smyCrypto.random_code(true, 16, 16);
      let public_key = appData.public_key;
      let expire_time = publicKeyRes.expire_time;
      
      api.checkSession({
        data: {
          data: app.smyCrypto.rsa_encrypt(JSON.stringify({ aes_key: random_code }), public_key),
          content: app.smyCrypto.aes_encrypt(JSON.stringify({ sessionkey: userInfo.sessionKey }), random_code),
          expire_time: expire_time
        },
        success(res) {
          if (res.status == 200) {
            let res_data = app.smyCrypto.aes_decrypt(res.data.data, random_code);
            let data = JSON.parse(res_data).data || {};
            
            if (data.isValid) {
              _this.setData({
                userInfo
              });
            }  else {
              my.removeStorageSync({
                key: 'userInfo'
              });
            }
          }
        },
        fail() {
          my.showToast({
            type: 'none',
            content: '登录失败，请稍后再试！',
            duration: 3000
          });
        }
      });
    })
  },

  // 获取PublicKey
  getPublicKey(publicKey, callback) {
    if (
      publicKey &&
      publicKey.length > 0 &&
      JSON.parse(publicKey).expire_time > new Date().getTime()
    ) {
      callback(publicKey);
    } else {
      api.keygen({
        success(res) {
          const { data } = res;

          if (data.code !== 200) {
            callback(data.data);
          } else {
            my.setStorageSync({
              key: 'public_key_data',
              data: JSON.stringify(data.data),
            });
            callback(data.data);
          }
        }
      });
    }
  },
});
