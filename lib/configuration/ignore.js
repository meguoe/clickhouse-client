'use strict';

exports.defaultIgnore = function(config) {
  // 默认条件返回true添加为条件，返回false时忽略条件
  config.registerIgnore('default', () => true);

  // 如果有值
  config.registerIgnore(
    'ifHave',
    ({ value }) =>
      value !== null &&
      typeof value !== 'undefined' &&
      String(value)
  );

  // 如果值为数字
  config.registerIgnore('ifNumber', ({ value }) => {
    return value !== null && !isNaN(value);
  });
};
