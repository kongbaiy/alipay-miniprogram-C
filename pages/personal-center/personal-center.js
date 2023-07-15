const app = getApp();
const appData = app.data;
const api = app.api;

Page({
  data: {
    userInfo: my.getStorageSync({ key: 'userInfo'}).data || {},
    userDefaultAvatar: appData.userDefaultAvatar,
    serviceList: [],
    privacyPolicyUrl: [
      {
        title: '《隐私政策》',
        redirectType: 1,
        url: 'https://tfsmy.chengdu.gov.cn/image-static/group1/M00/02/E7/oYYBAGDSnI-ABx_4AAKkIENCdvs71.html'
      },
      {
        title: '《用户协议》',
        redirectType: 1,
        url: 'https://tfsmy.chengdu.gov.cn/image-static/group1/M00/02/FC/pIYBAGDVTvyAAisKAAKoqdZb0-849.html'
      }
    ]
  },

  onLoad() {
    this.getServiceList({
      miniProgramsType: "支付宝小程序",
      districtAdcode: '510100'
    });
  },

  onLogin() {
    this.regOrLogin();
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

  /**
   * 获取服务列表
   * @param {object} params
   * @param {string} miniProgramsType
   * @param {string} districtAdcode
   * */
  getServiceList(params = {}) {
    api.serviceList({
      data: params,
      success: (res) => {
        const { data } = res;

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
          data.result.serviceinfo = service;
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
      delay: 3000,
    });
    my.getAuthCode({
      scopes: 'auth_user',
      success(authRes) {
        let public_key_data = JSON.parse(my.getStorageSync({ key: 'public_key_data' }).data) || '';

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
            }
          });
        });
      }
    });
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
