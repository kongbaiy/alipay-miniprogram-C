const config = {};
// config.host = 'https://cdpre.tfsmy.com';
config.host = 'https://tfsmy.chengdu.gov.cn';
config.middleware = `${config.host}/session-middleware-feature`;

// 天气接口
config.weather = (params) => 
my.request({
  url: `${config.host}/forecast/weather/day`,
  method: 'GET',
  ...params
});

// 服务列表
config.serviceList = (params) => 
my.request({
  url: `${config.host}/tfsmy-album-k8s-api/api/getinfo/list`,
  method: 'POST',
  ...params
});

// 注册或登录
config.regOrLogin = (params) => 
my.request({
  url: `${config.host}/AliPayMini-api/mp/alipay/v5/regOrLogin`,
  method: 'POST',
  headers: {
    'content-type': 'application/x-www-form-urlencoded'
  },
  dataType: 'json',
  ...params
});

// 获取验证码
config.getVerifyCode = (params) => 
my.request({
  url: `${config.host}/AliPayMini-api/mp/alipay/v5/getVerifyCode`,
  method: 'POST',
  ...params
});

// 检查sessionkey是否合法
config.checkSession = (params) => 
my.request({
  url: `${config.host}/AliPayMini-api/mp/alipay/v5/checkSession`,
  method: 'POST',
  headers: {
    'content-type': 'application/x-www-form-urlencoded'
  },
  dataType: 'json',
  ...params
});

//  注册or绑定
config.bind = (params) => 
my.request({
  url: `${config.host}/AliPayMini-api/mp/alipay/v5/bind`,
  method: 'POST',
  ...params
});

config.keygen = (params) => 
my.request({
  url: `${config.host}/api/rsa/keygen`,
  method: 'GET',
  ...params
});


export default config