## 项目简介

为nodejs访问clickhouse数据库提供强大流畅的api的工具类库，目标是希望访问数据库逻辑都能使用一行代码完成，让访问数据库变得更加简单优雅（本项目是在[ali-mysql-client](https://github.com/liuhuisheng/ali-mysql-client)基础上实现）。

## 使用说明

### 1. 初始化配置

初始化如下

```javascript
const ChClient = require('@meguoe/clickhouse-client');

const db = new ChClient({
  url: 'http://localhost',
  port: 7023,
  debug: false,
  format: 'json',
  isUseGzip: true,
  basicAuth: {
    username: 'default',
    password: '123456',
  },
  config: {
    session_timeout: 600,
  },
});
```

### 2. 构造查询

- 2.1 查询单个值

```javascript
// 查询单个值，比如下面例子返回的是数字51，满足条件的数据条数
const result = await db
  .select("count(1)")
  .from("page")
  .where("name", "测试", "like")
  .queryValue();
```

- 2.2 查询单条数据

```javascript
// 查询单条数据，返回的是 result = {id:12, name: '测试页面', ....}
const result = await db
  .select("*")
  .from("page")
  .where("id", 12) // id = 12
  .queryRow();
```

- 2.3 查询多条数据

```javascript
// 查询多条数据 返回的是 ressult = [{...}, {...}];
const result = await db
  .select("*")
  .from("page")
  .where("name", "测试页面", 'like') // name like '%测试页面%'
  .queryList();
```

- 2.4 服务端分页查询

```javascript
// 查询多条数据（服务端分页） 返回的是 ressult = {total: 100, rows:[{...}, {...}]};
const result = await db
  .select("*")
  .from("page")
  .where("id", 100, "lt") // id < 100
  .queryListWithPaging(3, 20); //每页 20 条，取第 3 页
```

- 2.5 转为sql自己处理

```javascript
const result = await db
  .select('id')
  .from('page')
  .where('id', 100)
  .toSql();

expect(result).toBe('select id from page where `id` = 100');
```

### 3. 构造插入

```javascript
const task = {
  action: "testA",
  description: "desc1",
  state: "123",
  result: "result1"
};

// 插入一条数据
const result = await db
  .insert("task", task)
  .execute();

// 也支持直接写字段，支持增加字段
const result = await db
  .insert("task")
  .column("action", "test")
  .column("create_time", Date.now())
  .execute();

// 插入多条数据
const tasks = [ task1, taks2, task3 ];
const result = await db
  .insert("task", tasks)
  .execute();

// 支持增加或覆盖字段
const result = await db
  .insert("task", tasks)
  .column('create_time', Date.now())  // 循环赋值给每一行数据
  .column('create_user', 'huisheng.lhs')
  .execute();
```

### 4. 构造更新

```javascript
const task = {
  action: "testA",
  description: "desc1",
  state: "123",
  result: "updateResult"
};

//更新数据
const result = await db
  .update("task", task)
  .where("id", 1)
  .execute();

//更新数据，支持增加字段
const result = await db
  .update("task")
  .column("action", "test-id22")
  .column("create_time", Date.now())
  .where('id', 2)
  .execute();

// 字面量使用 Date.now() 等价于 db.literal("now()")
const result = await db
  .update("task")
  .column("count", db.literal("count + 1"))
  .column("create_time", db.literal("now()"))
  .where('id', 2)
  .execute();
```

### 5. 构造删除

```javascript
//删除id为1的数据
const result = await db
  .delete("task")
  .where("id", 1)
  .execute();
```

### 6. 自定义SQL

```javascript
// 执行自定义SQL
const result = await db
  .sql('select id from page where `id` = ?')
  .params([ 100 ])
  .execute();
```

### 7. 复杂条件查询设计

#### 7.1 查询条件所有参数说明

```javascript
// 查询条件所有参数
const result = await db
  .where(field, value, operator, ignore, join) // 支持的所有参数
  .where({field, value, operator, ignore, join}) //支持对象参数
  .queryList();
  
// 复杂查询条件
const result = await db
  .select("*")
  .from("page")
  .where("id", 100, "gt") // id > 100
  .where("tags", "test", "like") //name like '%test%'
  .where("tech", tech, "eq", "ifHave") // tech='tech_value' 当 tech 为空时，不做为查询条件
  .where("tags", tags, "findinset", "ifHave", "or")
  .queryList();
```

- field 字段名
- value 传入值
- operator 操作符，默认equal4
- ignore 是否加为条件，返回false时则忽略该条件
- join 连接符号(and or)，默认为and

#### 7.2 查询条件优先级支持

```javascript
// where a = 1 and (b = 1 or c < 1) and d = 1
const result = await db.select('*')
  .from('table')
  .where('a', 1)
  .where([
    {field: 'b', value: '1', operator:'eq'},
    {field: 'c', value: '1', operator:'lt', join: 'or'},
  ])
  .where('d', 1)
  .queryList();
```

### 8. 监听事件

```javascript
const config = db.config();

// 监听事件 执行前
config.onBeforeExecute(function({ sql }) {
  console.log(sql);
});

// 监听事件 执行后
config.onAfterExecute(function({ sql, result }) {
  console.log(result);
});

// 监听事件 执行出错
config.onExecuteError(function({ sql, error }) {
  console.log(error);
});
```

### 9. 内置的operator及ignore

- [内置的默认operator](https://github.com/meguoe/clickhouse-client/blob/master/lib/configuration/operator.js)

  - eq (equal)
  - ne (not equal)
  - in (in)
  - gt (greater than)
  - ge (greater than or equal)
  - lt (less than)
  - le (less than or equal）
  - isnull (is null)
  - isnotnull (is not null)
  - like (like)
  - startwith (start with)
  - endwith (end with)
  - between (between)
  - findinset (find_in_set(value, field))
  - insetfind (find_in_set(field, value))
  - sql (custom sql)
  - keywords (keywords query)
- [内置的默认ignore](https://github.com/meguoe/clickhouse-client/blob/master/lib/configuration/ignore.js)

  - ifHave (如果有值则加为条件）
  - ifNumber (如果是数值则加为条件）
