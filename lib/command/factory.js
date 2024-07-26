'use strict';

const assert = require('assert');
const { ClickHouse } = require('clickhouse');

function createClickhouse(options) {
  assert(options, '初始化参数不能为空！');

  try {
    return new ClickHouse(options);
  } catch (e) {
    throw new Error('初始化参数不正确！');
  }
}

module.exports = createClickhouse;
