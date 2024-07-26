'use strict';

const DbProvider = require('./provider');
const SelectBuilder = require('./builder/select');
const InsertBuilder = require('./builder/insert');
const UpdateBuilder = require('./builder/update');
const DeleteBuilder = require('./builder/delete');
const CustomBuilder = require('./builder/custom');

class DbClient {
  constructor(options) {
    this.provider = new DbProvider(options);
  }

  select(sql) {
    return new SelectBuilder(this.provider, sql);
  }

  insert(table, data) {
    return new InsertBuilder(this.provider, table, data);
  }

  update(table, data) {
    return new UpdateBuilder(this.provider, table, data);
  }

  delete(table) {
    return new DeleteBuilder(this.provider, table);
  }

  sql(sql, arg) {
    return new CustomBuilder(this.provider, sql, arg);
  }

  config(config) {
    return this.provider.config.setConfig(config);
  }
}

module.exports = DbClient;
