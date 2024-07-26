'use strict';

const createClickhouse = require('./factory');
const Operator = require('ali-rds/lib/operator');
const format = Operator.prototype.format;

class DbCommand {
  constructor(options, config) {
    this.clickHouse = createClickhouse(options);
    this.format = format;
    this.config = config;
  }

  async execute({ sql, arg }) {
    const command = this;
    const handlerArg = {
      sql,
      sql_data: arg,
      sql_text: sql,
      clickHouse: command.clickHouse,
    };

    try {
      // 执行前处理
      handlerArg.sql = command.format(sql, arg);
      command.handleEvent('onBeforeExecute', handlerArg);

      // 执行sql
      const result = await command.clickHouse.query(handlerArg.sql, []).toPromise();

      // 执行后处理
      handlerArg.result = result;
      command.handleEvent('onAfterExecute', handlerArg);

      return result;
    } catch (e) {
      // 执行出错处理
      handlerArg.error = e;
      command.handleEvent('onExecuteError', handlerArg);
      throw e;
    }
  }

  handleEvent(type, arg) {
    const list = this.config.eventSubs.filter(item => item.type === type && typeof item.handler === 'function');
    list.map(item => item.handler(arg));
  }
}

DbCommand.format = format;

module.exports = DbCommand;
