const app = getApp();
const appData = app.data;

Page({
  data: {
    timeout: '',
    searchInputVal: '',
    searchHistory: my.getStorageSync({ key: 'searchHistory' }).data || [],
    list: []
  },

  onLoad() {},

  onSearchInput(e) {
    const { detail } = e; 
    this.setData({
      searchInputVal: detail.value
    });
    this.saveSearchHistory(detail.value);
  },

  onSearchInputConfirm(e) {
    this.onSearchInput(e);
  },

  onSearchHistory(e) {
    const { dataset } = e.target;
    
    this.setData({
      searchInputVal: dataset.item
    });
    this.saveSearchHistory(dataset.item);
  },

  saveSearchHistory(value) {
    const { data } = this;

    if (data.timeout) {
      clearTimeout(data.timeout);
    }
    
    data.timeout = setTimeout(callback => {
      if (value.trim()) {
        for(let i = 0;i < data.searchHistory.length; i++) {
          if (value === data.searchHistory[i]) {
            data.searchHistory.splice(i, 1)
            break;
          }
        }
        data.searchHistory.unshift(value);
      }

      if (data.searchHistory.length > 7) {
        data.searchHistory.pop();
      }
      
      this.setData({
        searchHistory: data.searchHistory,
        list: this.findSearchKeyword(value)
      });
      my.setStorageSync({
        key: 'searchHistory',
        data: data.searchHistory
      });
    }, 600);
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
   * 查询
   * @param {string} key 搜索关键字
   * */ 
  findSearchKeyword(key) {
    const { serviceList } = appData;
    const match = ['topserviceinfo', 'serviceinfo', 'insideservice'];
    const arr = [];

    if (!key) {
      return arr
    }

    for(let i = 0;i < match.length; i++) {
      let i_item = serviceList ? serviceList[match[i]] : '';

      if (i_item) {
        for(let e = 0;e < i_item.length; e++) {
          if (i_item[e].service_name && i_item[e].service_name.search(key) !== -1) {
            arr.push(i_item[e]);
          }

          if (i_item[e].service && i_item[e].service.search(key) !== -1) {
            arr.push(i_item[e]);
          }
        }
      }
    }
    return arr
  }
});
