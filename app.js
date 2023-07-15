
import api from '/api/index.js'
import { smy_crypto } from '/static/js/smycrypt.js';

App({
  data: {
    public_key: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCD9H+fRcxHvE0MAAPa1WmUVDxz3t6smsLr7MQc5oVIzWP77avHfQP+5TJQNw9G9Zcz7+xdMXIDLuyN6rmCzp5KkfM0fn30kj6RSpRxo6bewOUcCaMt6axBNbzr1tyAQohYN9nzQSyvC0D55579gJDNGqKe8p+OtISBveagNGNAvwIDAQAB',
    userDefaultAvatar: '/static/imgs/user_default_avatar.png'
  },
  onLaunch(options) {
    // 第一次打开
    // options.query == {number:1}
    console.info('App onLaunch');
  },
  onShow(options) {
    // 从后台被 scheme 重新打开
    // options.query == {number:1}
  },
  api,
  smyCrypto: smy_crypto
});
