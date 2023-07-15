
const app = getApp();
const api = app.api;

Page({
  data: {
    url: '',
   
  },

  onLoad(query) {
   this.setData({
     url: this.getWebViewUrl(query.url)
   });
  },

  /**
   * webview url
   * @param {string} url
   * */ 
  getWebViewUrl(url) {
    const user_info = my.getStorageSync({ key: 'userInfo'}).data || {};
    const webview_url = `${api.middleware}?token=${user_info.sessionKey}&url=${url}&_=${Date.now()}`;
    
    return webview_url
  }
});
