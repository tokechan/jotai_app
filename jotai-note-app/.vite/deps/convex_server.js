import {
  ConvexError,
  anyApi,
  asObjectValidator,
  convexOrUndefinedToJson,
  convexToJson,
  filterApi,
  getFunctionAddress,
  getFunctionName,
  isValidator,
  jsonToConvex,
  makeFunctionReference,
  parseArgs,
  patchValueToJson,
  setReferencePath,
  toReferencePath,
  v,
  version
} from "./chunk-ZELGIS4D.js";
import "./chunk-DWA4UIM3.js";

// node_modules/convex/dist/esm/server/impl/syscall.js
function performSyscall(op, arg) {
  if (typeof Convex === "undefined" || Convex.syscall === void 0) {
    throw new Error(
      "The Convex database and auth objects are being used outside of a Convex backend. Did you mean to use `useQuery` or `useMutation` to call a Convex function?"
    );
  }
  const resultStr = Convex.syscall(op, JSON.stringify(arg));
  return JSON.parse(resultStr);
}
async function performAsyncSyscall(op, arg) {
  if (typeof Convex === "undefined" || Convex.asyncSyscall === void 0) {
    throw new Error(
      "The Convex database and auth objects are being used outside of a Convex backend. Did you mean to use `useQuery` or `useMutation` to call a Convex function?"
    );
  }
  let resultStr;
  try {
    resultStr = await Convex.asyncSyscall(op, JSON.stringify(arg));
  } catch (e) {
    if (e.data !== void 0) {
      const rethrown = new ConvexError(e.message);
      rethrown.data = jsonToConvex(e.data);
      throw rethrown;
    }
    throw new Error(e.message);
  }
  return JSON.parse(resultStr);
}
function performJsSyscall(op, arg) {
  if (typeof Convex === "undefined" || Convex.jsSyscall === void 0) {
    throw new Error(
      "The Convex database and auth objects are being used outside of a Convex backend. Did you mean to use `useQuery` or `useMutation` to call a Convex function?"
    );
  }
  return Convex.jsSyscall(op, arg);
}

// node_modules/convex/dist/esm/server/impl/actions_impl.js
function syscallArgs(requestId, functionReference, args) {
  const address = getFunctionAddress(functionReference);
  return {
    ...address,
    args: convexToJson(parseArgs(args)),
    version,
    requestId
  };
}
function setupActionCalls(requestId) {
  return {
    runQuery: async (query, args) => {
      const result = await performAsyncSyscall(
        "1.0/actions/query",
        syscallArgs(requestId, query, args)
      );
      return jsonToConvex(result);
    },
    runMutation: async (mutation, args) => {
      const result = await performAsyncSyscall(
        "1.0/actions/mutation",
        syscallArgs(requestId, mutation, args)
      );
      return jsonToConvex(result);
    },
    runAction: async (action, args) => {
      const result = await performAsyncSyscall(
        "1.0/actions/action",
        syscallArgs(requestId, action, args)
      );
      return jsonToConvex(result);
    }
  };
}

// node_modules/convex/dist/esm/server/vector_search.js
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var FilterExpression = class {
  /**
   * @internal
   */
  constructor() {
    __publicField(this, "_isExpression");
    __publicField(this, "_value");
  }
};

// node_modules/convex/dist/esm/server/impl/validate.js
function validateArg(arg, idx, method, argName) {
  if (arg === void 0) {
    throw new TypeError(
      `Must provide arg ${idx} \`${argName}\` to \`${method}\``
    );
  }
}
function validateArgIsNonNegativeInteger(arg, idx, method, argName) {
  if (!Number.isInteger(arg) || arg < 0) {
    throw new TypeError(
      `Arg ${idx} \`${argName}\` to \`${method}\` must be a non-negative integer`
    );
  }
}

// node_modules/convex/dist/esm/server/impl/vector_search_impl.js
var __defProp2 = Object.defineProperty;
var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField2 = (obj, key, value) => __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
function setupActionVectorSearch(requestId) {
  return async (tableName, indexName, query) => {
    validateArg(tableName, 1, "vectorSearch", "tableName");
    validateArg(indexName, 2, "vectorSearch", "indexName");
    validateArg(query, 3, "vectorSearch", "query");
    if (!query.vector || !Array.isArray(query.vector) || query.vector.length === 0) {
      throw Error("`vector` must be a non-empty Array in vectorSearch");
    }
    return await new VectorQueryImpl(
      requestId,
      tableName + "." + indexName,
      query
    ).collect();
  };
}
var VectorQueryImpl = class {
  constructor(requestId, indexName, query) {
    __publicField2(this, "requestId");
    __publicField2(this, "state");
    this.requestId = requestId;
    const filters = query.filter ? serializeExpression(query.filter(filterBuilderImpl)) : null;
    this.state = {
      type: "preparing",
      query: {
        indexName,
        limit: query.limit,
        vector: query.vector,
        expressions: filters
      }
    };
  }
  async collect() {
    if (this.state.type === "consumed") {
      throw new Error("This query is closed and can't emit any more values.");
    }
    const query = this.state.query;
    this.state = { type: "consumed" };
    const { results } = await performAsyncSyscall("1.0/actions/vectorSearch", {
      requestId: this.requestId,
      version,
      query
    });
    return results;
  }
};
var ExpressionImpl = class extends FilterExpression {
  constructor(inner) {
    super();
    __publicField2(this, "inner");
    this.inner = inner;
  }
  serialize() {
    return this.inner;
  }
};
function serializeExpression(expr) {
  if (expr instanceof ExpressionImpl) {
    return expr.serialize();
  } else {
    return { $literal: convexOrUndefinedToJson(expr) };
  }
}
var filterBuilderImpl = {
  //  Comparisons  /////////////////////////////////////////////////////////////
  eq(fieldName, value) {
    if (typeof fieldName !== "string") {
      throw new Error("The first argument to `q.eq` must be a field name.");
    }
    return new ExpressionImpl({
      $eq: [
        serializeExpression(new ExpressionImpl({ $field: fieldName })),
        serializeExpression(value)
      ]
    });
  },
  //  Logic  ///////////////////////////////////////////////////////////////////
  or(...exprs) {
    return new ExpressionImpl({ $or: exprs.map(serializeExpression) });
  }
};

// node_modules/convex/dist/esm/server/impl/authentication_impl.js
function setupAuth(requestId) {
  return {
    getUserIdentity: async () => {
      return await performAsyncSyscall("1.0/getUserIdentity", {
        requestId
      });
    }
  };
}

// node_modules/convex/dist/esm/server/filter_builder.js
var __defProp3 = Object.defineProperty;
var __defNormalProp3 = (obj, key, value) => key in obj ? __defProp3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField3 = (obj, key, value) => __defNormalProp3(obj, typeof key !== "symbol" ? key + "" : key, value);
var Expression = class {
  /**
   * @internal
   */
  constructor() {
    __publicField3(this, "_isExpression");
    __publicField3(this, "_value");
  }
};

// node_modules/convex/dist/esm/server/impl/filter_builder_impl.js
var __defProp4 = Object.defineProperty;
var __defNormalProp4 = (obj, key, value) => key in obj ? __defProp4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField4 = (obj, key, value) => __defNormalProp4(obj, typeof key !== "symbol" ? key + "" : key, value);
var ExpressionImpl2 = class extends Expression {
  constructor(inner) {
    super();
    __publicField4(this, "inner");
    this.inner = inner;
  }
  serialize() {
    return this.inner;
  }
};
function serializeExpression2(expr) {
  if (expr instanceof ExpressionImpl2) {
    return expr.serialize();
  } else {
    return { $literal: convexOrUndefinedToJson(expr) };
  }
}
var filterBuilderImpl2 = {
  //  Comparisons  /////////////////////////////////////////////////////////////
  eq(l, r) {
    return new ExpressionImpl2({
      $eq: [serializeExpression2(l), serializeExpression2(r)]
    });
  },
  neq(l, r) {
    return new ExpressionImpl2({
      $neq: [serializeExpression2(l), serializeExpression2(r)]
    });
  },
  lt(l, r) {
    return new ExpressionImpl2({
      $lt: [serializeExpression2(l), serializeExpression2(r)]
    });
  },
  lte(l, r) {
    return new ExpressionImpl2({
      $lte: [serializeExpression2(l), serializeExpression2(r)]
    });
  },
  gt(l, r) {
    return new ExpressionImpl2({
      $gt: [serializeExpression2(l), serializeExpression2(r)]
    });
  },
  gte(l, r) {
    return new ExpressionImpl2({
      $gte: [serializeExpression2(l), serializeExpression2(r)]
    });
  },
  //  Arithmetic  //////////////////////////////////////////////////////////////
  add(l, r) {
    return new ExpressionImpl2({
      $add: [serializeExpression2(l), serializeExpression2(r)]
    });
  },
  sub(l, r) {
    return new ExpressionImpl2({
      $sub: [serializeExpression2(l), serializeExpression2(r)]
    });
  },
  mul(l, r) {
    return new ExpressionImpl2({
      $mul: [serializeExpression2(l), serializeExpression2(r)]
    });
  },
  div(l, r) {
    return new ExpressionImpl2({
      $div: [serializeExpression2(l), serializeExpression2(r)]
    });
  },
  mod(l, r) {
    return new ExpressionImpl2({
      $mod: [serializeExpression2(l), serializeExpression2(r)]
    });
  },
  neg(x) {
    return new ExpressionImpl2({ $neg: serializeExpression2(x) });
  },
  //  Logic  ///////////////////////////////////////////////////////////////////
  and(...exprs) {
    return new ExpressionImpl2({ $and: exprs.map(serializeExpression2) });
  },
  or(...exprs) {
    return new ExpressionImpl2({ $or: exprs.map(serializeExpression2) });
  },
  not(x) {
    return new ExpressionImpl2({ $not: serializeExpression2(x) });
  },
  //  Other  ///////////////////////////////////////////////////////////////////
  field(fieldPath) {
    return new ExpressionImpl2({ $field: fieldPath });
  }
};

// node_modules/convex/dist/esm/server/index_range_builder.js
var __defProp5 = Object.defineProperty;
var __defNormalProp5 = (obj, key, value) => key in obj ? __defProp5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField5 = (obj, key, value) => __defNormalProp5(obj, typeof key !== "symbol" ? key + "" : key, value);
var IndexRange = class {
  /**
   * @internal
   */
  constructor() {
    __publicField5(this, "_isIndexRange");
  }
};

// node_modules/convex/dist/esm/server/impl/index_range_builder_impl.js
var __defProp6 = Object.defineProperty;
var __defNormalProp6 = (obj, key, value) => key in obj ? __defProp6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField6 = (obj, key, value) => __defNormalProp6(obj, typeof key !== "symbol" ? key + "" : key, value);
var IndexRangeBuilderImpl = class _IndexRangeBuilderImpl extends IndexRange {
  constructor(rangeExpressions) {
    super();
    __publicField6(this, "rangeExpressions");
    __publicField6(this, "isConsumed");
    this.rangeExpressions = rangeExpressions;
    this.isConsumed = false;
  }
  static new() {
    return new _IndexRangeBuilderImpl([]);
  }
  consume() {
    if (this.isConsumed) {
      throw new Error(
        "IndexRangeBuilder has already been used! Chain your method calls like `q => q.eq(...).eq(...)`. See https://docs.convex.dev/using/indexes"
      );
    }
    this.isConsumed = true;
  }
  eq(fieldName, value) {
    this.consume();
    return new _IndexRangeBuilderImpl(
      this.rangeExpressions.concat({
        type: "Eq",
        fieldPath: fieldName,
        value: convexOrUndefinedToJson(value)
      })
    );
  }
  gt(fieldName, value) {
    this.consume();
    return new _IndexRangeBuilderImpl(
      this.rangeExpressions.concat({
        type: "Gt",
        fieldPath: fieldName,
        value: convexToJson(value)
      })
    );
  }
  gte(fieldName, value) {
    this.consume();
    return new _IndexRangeBuilderImpl(
      this.rangeExpressions.concat({
        type: "Gte",
        fieldPath: fieldName,
        value: convexToJson(value)
      })
    );
  }
  lt(fieldName, value) {
    this.consume();
    return new _IndexRangeBuilderImpl(
      this.rangeExpressions.concat({
        type: "Lt",
        fieldPath: fieldName,
        value: convexToJson(value)
      })
    );
  }
  lte(fieldName, value) {
    this.consume();
    return new _IndexRangeBuilderImpl(
      this.rangeExpressions.concat({
        type: "Lte",
        fieldPath: fieldName,
        value: convexToJson(value)
      })
    );
  }
  export() {
    this.consume();
    return this.rangeExpressions;
  }
};

// node_modules/convex/dist/esm/server/search_filter_builder.js
var __defProp7 = Object.defineProperty;
var __defNormalProp7 = (obj, key, value) => key in obj ? __defProp7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField7 = (obj, key, value) => __defNormalProp7(obj, typeof key !== "symbol" ? key + "" : key, value);
var SearchFilter = class {
  /**
   * @internal
   */
  constructor() {
    __publicField7(this, "_isSearchFilter");
  }
};

// node_modules/convex/dist/esm/server/impl/search_filter_builder_impl.js
var __defProp8 = Object.defineProperty;
var __defNormalProp8 = (obj, key, value) => key in obj ? __defProp8(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField8 = (obj, key, value) => __defNormalProp8(obj, typeof key !== "symbol" ? key + "" : key, value);
var SearchFilterBuilderImpl = class _SearchFilterBuilderImpl extends SearchFilter {
  constructor(filters) {
    super();
    __publicField8(this, "filters");
    __publicField8(this, "isConsumed");
    this.filters = filters;
    this.isConsumed = false;
  }
  static new() {
    return new _SearchFilterBuilderImpl([]);
  }
  consume() {
    if (this.isConsumed) {
      throw new Error(
        "SearchFilterBuilder has already been used! Chain your method calls like `q => q.search(...).eq(...)`."
      );
    }
    this.isConsumed = true;
  }
  search(fieldName, query) {
    validateArg(fieldName, 1, "search", "fieldName");
    validateArg(query, 2, "search", "query");
    this.consume();
    return new _SearchFilterBuilderImpl(
      this.filters.concat({
        type: "Search",
        fieldPath: fieldName,
        value: query
      })
    );
  }
  eq(fieldName, value) {
    validateArg(fieldName, 1, "eq", "fieldName");
    if (arguments.length !== 2) {
      validateArg(value, 2, "search", "value");
    }
    this.consume();
    return new _SearchFilterBuilderImpl(
      this.filters.concat({
        type: "Eq",
        fieldPath: fieldName,
        value: convexOrUndefinedToJson(value)
      })
    );
  }
  export() {
    this.consume();
    return this.filters;
  }
};

// node_modules/convex/dist/esm/server/impl/query_impl.js
var __defProp9 = Object.defineProperty;
var __defNormalProp9 = (obj, key, value) => key in obj ? __defProp9(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField9 = (obj, key, value) => __defNormalProp9(obj, typeof key !== "symbol" ? key + "" : key, value);
var QueryInitializerImpl = class {
  constructor(tableName) {
    __publicField9(this, "tableName");
    this.tableName = tableName;
  }
  withIndex(indexName, indexRange) {
    validateArg(indexName, 1, "withIndex", "indexName");
    let rangeBuilder = IndexRangeBuilderImpl.new();
    if (indexRange !== void 0) {
      rangeBuilder = indexRange(rangeBuilder);
    }
    return new QueryImpl({
      source: {
        type: "IndexRange",
        indexName: this.tableName + "." + indexName,
        range: rangeBuilder.export(),
        order: null
      },
      operators: []
    });
  }
  withSearchIndex(indexName, searchFilter) {
    validateArg(indexName, 1, "withSearchIndex", "indexName");
    validateArg(searchFilter, 2, "withSearchIndex", "searchFilter");
    const searchFilterBuilder = SearchFilterBuilderImpl.new();
    return new QueryImpl({
      source: {
        type: "Search",
        indexName: this.tableName + "." + indexName,
        filters: searchFilter(searchFilterBuilder).export()
      },
      operators: []
    });
  }
  fullTableScan() {
    return new QueryImpl({
      source: {
        type: "FullTableScan",
        tableName: this.tableName,
        order: null
      },
      operators: []
    });
  }
  order(order) {
    return this.fullTableScan().order(order);
  }
  // This is internal API and should not be exposed to developers yet.
  async count() {
    const syscallJSON = await performAsyncSyscall("1.0/count", {
      table: this.tableName
    });
    const syscallResult = jsonToConvex(syscallJSON);
    return syscallResult;
  }
  filter(predicate) {
    return this.fullTableScan().filter(predicate);
  }
  limit(n) {
    return this.fullTableScan().limit(n);
  }
  collect() {
    return this.fullTableScan().collect();
  }
  take(n) {
    return this.fullTableScan().take(n);
  }
  paginate(paginationOpts) {
    return this.fullTableScan().paginate(paginationOpts);
  }
  first() {
    return this.fullTableScan().first();
  }
  unique() {
    return this.fullTableScan().unique();
  }
  [Symbol.asyncIterator]() {
    return this.fullTableScan()[Symbol.asyncIterator]();
  }
};
function throwClosedError(type) {
  throw new Error(
    type === "consumed" ? "This query is closed and can't emit any more values." : "This query has been chained with another operator and can't be reused."
  );
}
var QueryImpl = class _QueryImpl {
  constructor(query) {
    __publicField9(this, "state");
    this.state = { type: "preparing", query };
  }
  takeQuery() {
    if (this.state.type !== "preparing") {
      throw new Error(
        "A query can only be chained once and can't be chained after iteration begins."
      );
    }
    const query = this.state.query;
    this.state = { type: "closed" };
    return query;
  }
  startQuery() {
    if (this.state.type === "executing") {
      throw new Error("Iteration can only begin on a query once.");
    }
    if (this.state.type === "closed" || this.state.type === "consumed") {
      throwClosedError(this.state.type);
    }
    const query = this.state.query;
    const { queryId } = performSyscall("1.0/queryStream", { query, version });
    this.state = { type: "executing", queryId };
    return queryId;
  }
  closeQuery() {
    if (this.state.type === "executing") {
      const queryId = this.state.queryId;
      performSyscall("1.0/queryCleanup", { queryId });
    }
    this.state = { type: "consumed" };
  }
  order(order) {
    validateArg(order, 1, "order", "order");
    const query = this.takeQuery();
    if (query.source.type === "Search") {
      throw new Error(
        "Search queries must always be in relevance order. Can not set order manually."
      );
    }
    if (query.source.order !== null) {
      throw new Error("Queries may only specify order at most once");
    }
    query.source.order = order;
    return new _QueryImpl(query);
  }
  filter(predicate) {
    validateArg(predicate, 1, "filter", "predicate");
    const query = this.takeQuery();
    query.operators.push({
      filter: serializeExpression2(predicate(filterBuilderImpl2))
    });
    return new _QueryImpl(query);
  }
  limit(n) {
    validateArg(n, 1, "limit", "n");
    const query = this.takeQuery();
    query.operators.push({ limit: n });
    return new _QueryImpl(query);
  }
  [Symbol.asyncIterator]() {
    this.startQuery();
    return this;
  }
  async next() {
    if (this.state.type === "closed" || this.state.type === "consumed") {
      throwClosedError(this.state.type);
    }
    const queryId = this.state.type === "preparing" ? this.startQuery() : this.state.queryId;
    const { value, done } = await performAsyncSyscall("1.0/queryStreamNext", {
      queryId
    });
    if (done) {
      this.closeQuery();
    }
    const convexValue = jsonToConvex(value);
    return { value: convexValue, done };
  }
  return() {
    this.closeQuery();
    return Promise.resolve({ done: true, value: void 0 });
  }
  async paginate(paginationOpts) {
    validateArg(paginationOpts, 1, "paginate", "options");
    if (typeof (paginationOpts == null ? void 0 : paginationOpts.numItems) !== "number" || paginationOpts.numItems < 0) {
      throw new Error(
        `\`options.numItems\` must be a positive number. Received \`${paginationOpts == null ? void 0 : paginationOpts.numItems}\`.`
      );
    }
    const query = this.takeQuery();
    const pageSize = paginationOpts.numItems;
    const cursor = paginationOpts.cursor;
    const endCursor = (paginationOpts == null ? void 0 : paginationOpts.endCursor) ?? null;
    const maximumRowsRead = paginationOpts.maximumRowsRead ?? null;
    const { page, isDone, continueCursor, splitCursor, pageStatus } = await performAsyncSyscall("1.0/queryPage", {
      query,
      cursor,
      endCursor,
      pageSize,
      maximumRowsRead,
      maximumBytesRead: paginationOpts.maximumBytesRead,
      version
    });
    return {
      page: page.map((json) => jsonToConvex(json)),
      isDone,
      continueCursor,
      splitCursor,
      pageStatus
    };
  }
  async collect() {
    const out = [];
    for await (const item of this) {
      out.push(item);
    }
    return out;
  }
  async take(n) {
    validateArg(n, 1, "take", "n");
    validateArgIsNonNegativeInteger(n, 1, "take", "n");
    return this.limit(n).collect();
  }
  async first() {
    const first_array = await this.take(1);
    return first_array.length === 0 ? null : first_array[0];
  }
  async unique() {
    const first_two_array = await this.take(2);
    if (first_two_array.length === 0) {
      return null;
    }
    if (first_two_array.length === 2) {
      throw new Error("unique() query returned more than one result");
    }
    return first_two_array[0];
  }
};

// node_modules/convex/dist/esm/server/impl/database_impl.js
async function get(id, isSystem) {
  validateArg(id, 1, "get", "id");
  if (typeof id !== "string") {
    throw new Error(
      `Invalid argument \`id\` for \`db.get\`, expected string but got '${typeof id}': ${id}`
    );
  }
  const args = {
    id: convexToJson(id),
    isSystem,
    version
  };
  const syscallJSON = await performAsyncSyscall("1.0/get", args);
  return jsonToConvex(syscallJSON);
}
function setupReader() {
  const reader = (isSystem = false) => {
    return {
      get: async (id) => {
        return await get(id, isSystem);
      },
      query: (tableName) => {
        return new TableReader(tableName, isSystem).query();
      },
      normalizeId: (tableName, id) => {
        validateArg(tableName, 1, "normalizeId", "tableName");
        validateArg(id, 2, "normalizeId", "id");
        const accessingSystemTable = tableName.startsWith("_");
        if (accessingSystemTable !== isSystem) {
          throw new Error(
            `${accessingSystemTable ? "System" : "User"} tables can only be accessed from db.${isSystem ? "" : "system."}normalizeId().`
          );
        }
        const syscallJSON = performSyscall("1.0/db/normalizeId", {
          table: tableName,
          idString: id
        });
        const syscallResult = jsonToConvex(syscallJSON);
        return syscallResult.id;
      },
      // We set the system reader on the next line
      system: null,
      table: (tableName) => {
        return new TableReader(tableName, isSystem);
      }
    };
  };
  const { system: _, ...rest } = reader(true);
  const r = reader();
  r.system = rest;
  return r;
}
async function insert(tableName, value) {
  if (tableName.startsWith("_")) {
    throw new Error("System tables (prefixed with `_`) are read-only.");
  }
  validateArg(tableName, 1, "insert", "table");
  validateArg(value, 2, "insert", "value");
  const syscallJSON = await performAsyncSyscall("1.0/insert", {
    table: tableName,
    value: convexToJson(value)
  });
  const syscallResult = jsonToConvex(syscallJSON);
  return syscallResult._id;
}
async function patch(id, value) {
  validateArg(id, 1, "patch", "id");
  validateArg(value, 2, "patch", "value");
  await performAsyncSyscall("1.0/shallowMerge", {
    id: convexToJson(id),
    value: patchValueToJson(value)
  });
}
async function replace(id, value) {
  validateArg(id, 1, "replace", "id");
  validateArg(value, 2, "replace", "value");
  await performAsyncSyscall("1.0/replace", {
    id: convexToJson(id),
    value: convexToJson(value)
  });
}
async function delete_(id) {
  validateArg(id, 1, "delete", "id");
  await performAsyncSyscall("1.0/remove", { id: convexToJson(id) });
}
function setupWriter() {
  const reader = setupReader();
  return {
    get: reader.get,
    query: reader.query,
    normalizeId: reader.normalizeId,
    system: reader.system,
    insert: async (table, value) => {
      return await insert(table, value);
    },
    patch: async (id, value) => {
      return await patch(id, value);
    },
    replace: async (id, value) => {
      return await replace(id, value);
    },
    delete: async (id) => {
      return await delete_(id);
    },
    table: (tableName) => {
      return new TableWriter(tableName, false);
    }
  };
}
var TableReader = class {
  constructor(tableName, isSystem) {
    this.tableName = tableName;
    this.isSystem = isSystem;
  }
  async get(id) {
    return get(id, this.isSystem);
  }
  query() {
    const accessingSystemTable = this.tableName.startsWith("_");
    if (accessingSystemTable !== this.isSystem) {
      throw new Error(
        `${accessingSystemTable ? "System" : "User"} tables can only be accessed from db.${this.isSystem ? "" : "system."}query().`
      );
    }
    return new QueryInitializerImpl(this.tableName);
  }
};
var TableWriter = class extends TableReader {
  async insert(value) {
    return insert(this.tableName, value);
  }
  async patch(id, value) {
    return patch(id, value);
  }
  async replace(id, value) {
    return replace(id, value);
  }
  async delete(id) {
    return delete_(id);
  }
};

// node_modules/convex/dist/esm/server/impl/scheduler_impl.js
function setupMutationScheduler() {
  return {
    runAfter: async (delayMs, functionReference, args) => {
      const syscallArgs2 = runAfterSyscallArgs(delayMs, functionReference, args);
      return await performAsyncSyscall("1.0/schedule", syscallArgs2);
    },
    runAt: async (ms_since_epoch_or_date, functionReference, args) => {
      const syscallArgs2 = runAtSyscallArgs(
        ms_since_epoch_or_date,
        functionReference,
        args
      );
      return await performAsyncSyscall("1.0/schedule", syscallArgs2);
    },
    cancel: async (id) => {
      validateArg(id, 1, "cancel", "id");
      const args = { id: convexToJson(id) };
      await performAsyncSyscall("1.0/cancel_job", args);
    }
  };
}
function setupActionScheduler(requestId) {
  return {
    runAfter: async (delayMs, functionReference, args) => {
      const syscallArgs2 = {
        requestId,
        ...runAfterSyscallArgs(delayMs, functionReference, args)
      };
      return await performAsyncSyscall("1.0/actions/schedule", syscallArgs2);
    },
    runAt: async (ms_since_epoch_or_date, functionReference, args) => {
      const syscallArgs2 = {
        requestId,
        ...runAtSyscallArgs(ms_since_epoch_or_date, functionReference, args)
      };
      return await performAsyncSyscall("1.0/actions/schedule", syscallArgs2);
    },
    cancel: async (id) => {
      validateArg(id, 1, "cancel", "id");
      const syscallArgs2 = { id: convexToJson(id) };
      return await performAsyncSyscall("1.0/actions/cancel_job", syscallArgs2);
    }
  };
}
function runAfterSyscallArgs(delayMs, functionReference, args) {
  if (typeof delayMs !== "number") {
    throw new Error("`delayMs` must be a number");
  }
  if (!isFinite(delayMs)) {
    throw new Error("`delayMs` must be a finite number");
  }
  if (delayMs < 0) {
    throw new Error("`delayMs` must be non-negative");
  }
  const functionArgs = parseArgs(args);
  const address = getFunctionAddress(functionReference);
  const ts = (Date.now() + delayMs) / 1e3;
  return {
    ...address,
    ts,
    args: convexToJson(functionArgs),
    version
  };
}
function runAtSyscallArgs(ms_since_epoch_or_date, functionReference, args) {
  let ts;
  if (ms_since_epoch_or_date instanceof Date) {
    ts = ms_since_epoch_or_date.valueOf() / 1e3;
  } else if (typeof ms_since_epoch_or_date === "number") {
    ts = ms_since_epoch_or_date / 1e3;
  } else {
    throw new Error("The invoke time must a Date or a timestamp");
  }
  const address = getFunctionAddress(functionReference);
  const functionArgs = parseArgs(args);
  return {
    ...address,
    ts,
    args: convexToJson(functionArgs),
    version
  };
}

// node_modules/convex/dist/esm/server/impl/storage_impl.js
function setupStorageReader(requestId) {
  return {
    getUrl: async (storageId) => {
      validateArg(storageId, 1, "getUrl", "storageId");
      return await performAsyncSyscall("1.0/storageGetUrl", {
        requestId,
        version,
        storageId
      });
    },
    getMetadata: async (storageId) => {
      return await performAsyncSyscall("1.0/storageGetMetadata", {
        requestId,
        version,
        storageId
      });
    }
  };
}
function setupStorageWriter(requestId) {
  const reader = setupStorageReader(requestId);
  return {
    generateUploadUrl: async () => {
      return await performAsyncSyscall("1.0/storageGenerateUploadUrl", {
        requestId,
        version
      });
    },
    delete: async (storageId) => {
      await performAsyncSyscall("1.0/storageDelete", {
        requestId,
        version,
        storageId
      });
    },
    getUrl: reader.getUrl,
    getMetadata: reader.getMetadata
  };
}
function setupStorageActionWriter(requestId) {
  const writer = setupStorageWriter(requestId);
  return {
    ...writer,
    store: async (blob, options) => {
      return await performJsSyscall("storage/storeBlob", {
        requestId,
        version,
        blob,
        options
      });
    },
    get: async (storageId) => {
      return await performJsSyscall("storage/getBlob", {
        requestId,
        version,
        storageId
      });
    }
  };
}

// node_modules/convex/dist/esm/server/impl/registration_impl.js
async function invokeMutation(func, argsStr) {
  const requestId = "";
  const args = jsonToConvex(JSON.parse(argsStr));
  const mutationCtx = {
    db: setupWriter(),
    auth: setupAuth(requestId),
    storage: setupStorageWriter(requestId),
    scheduler: setupMutationScheduler(),
    runQuery: (reference, args2) => runUdf("query", reference, args2),
    runMutation: (reference, args2) => runUdf("mutation", reference, args2)
  };
  const result = await invokeFunction(func, mutationCtx, args);
  validateReturnValue(result);
  return JSON.stringify(convexToJson(result === void 0 ? null : result));
}
function validateReturnValue(v2) {
  if (v2 instanceof QueryInitializerImpl || v2 instanceof QueryImpl) {
    throw new Error(
      "Return value is a Query. Results must be retrieved with `.collect()`, `.take(n), `.unique()`, or `.first()`."
    );
  }
}
async function invokeFunction(func, ctx, args) {
  let result;
  try {
    result = await Promise.resolve(func(ctx, ...args));
  } catch (thrown) {
    throw serializeConvexErrorData(thrown);
  }
  return result;
}
function dontCallDirectly(funcType, handler) {
  return (ctx, args) => {
    globalThis.console.warn(
      `Convex functions should not directly call other Convex functions. Consider calling a helper function instead. e.g. \`export const foo = ${funcType}(...); await foo(ctx);\` is not supported. See https://docs.convex.dev/production/best-practices/#use-helper-functions-to-write-shared-code`
    );
    return handler(ctx, args);
  };
}
function serializeConvexErrorData(thrown) {
  if (typeof thrown === "object" && thrown !== null && Symbol.for("ConvexError") in thrown) {
    const error = thrown;
    error.data = JSON.stringify(
      convexToJson(error.data === void 0 ? null : error.data)
    );
    error.ConvexErrorSymbol = Symbol.for("ConvexError");
    return error;
  } else {
    return thrown;
  }
}
function assertNotBrowser() {
  var _a, _b;
  if (typeof window === "undefined" || !window.__convexAllowFunctionsInBrowser) {
    return;
  }
  const isRealBrowser = ((_b = (_a = Object.getOwnPropertyDescriptor(globalThis, "window")) == null ? void 0 : _a.get) == null ? void 0 : _b.toString().includes("[native code]")) ?? false;
  if (isRealBrowser) {
    throw new Error("Convex functions should not be imported in the browser.");
  }
}
function exportArgs(functionDefinition) {
  return () => {
    let args = v.any();
    if (typeof functionDefinition === "object" && functionDefinition.args !== void 0) {
      args = asObjectValidator(functionDefinition.args);
    }
    return JSON.stringify(args.json);
  };
}
function exportReturns(functionDefinition) {
  return () => {
    let returns;
    if (typeof functionDefinition === "object" && functionDefinition.returns !== void 0) {
      returns = asObjectValidator(functionDefinition.returns);
    }
    return JSON.stringify(returns ? returns.json : null);
  };
}
var mutationGeneric = (functionDefinition) => {
  const handler = typeof functionDefinition === "function" ? functionDefinition : functionDefinition.handler;
  const func = dontCallDirectly("mutation", handler);
  assertNotBrowser();
  func.isMutation = true;
  func.isPublic = true;
  func.invokeMutation = (argsStr) => invokeMutation(handler, argsStr);
  func.exportArgs = exportArgs(functionDefinition);
  func.exportReturns = exportReturns(functionDefinition);
  func._handler = handler;
  return func;
};
var internalMutationGeneric = (functionDefinition) => {
  const handler = typeof functionDefinition === "function" ? functionDefinition : functionDefinition.handler;
  const func = dontCallDirectly(
    "internalMutation",
    handler
  );
  assertNotBrowser();
  func.isMutation = true;
  func.isInternal = true;
  func.invokeMutation = (argsStr) => invokeMutation(handler, argsStr);
  func.exportArgs = exportArgs(functionDefinition);
  func.exportReturns = exportReturns(functionDefinition);
  func._handler = handler;
  return func;
};
async function invokeQuery(func, argsStr) {
  const requestId = "";
  const args = jsonToConvex(JSON.parse(argsStr));
  const queryCtx = {
    db: setupReader(),
    auth: setupAuth(requestId),
    storage: setupStorageReader(requestId),
    runQuery: (reference, args2) => runUdf("query", reference, args2)
  };
  const result = await invokeFunction(func, queryCtx, args);
  validateReturnValue(result);
  return JSON.stringify(convexToJson(result === void 0 ? null : result));
}
var queryGeneric = (functionDefinition) => {
  const handler = typeof functionDefinition === "function" ? functionDefinition : functionDefinition.handler;
  const func = dontCallDirectly("query", handler);
  assertNotBrowser();
  func.isQuery = true;
  func.isPublic = true;
  func.invokeQuery = (argsStr) => invokeQuery(handler, argsStr);
  func.exportArgs = exportArgs(functionDefinition);
  func.exportReturns = exportReturns(functionDefinition);
  func._handler = handler;
  return func;
};
var internalQueryGeneric = (functionDefinition) => {
  const handler = typeof functionDefinition === "function" ? functionDefinition : functionDefinition.handler;
  const func = dontCallDirectly("internalQuery", handler);
  assertNotBrowser();
  func.isQuery = true;
  func.isInternal = true;
  func.invokeQuery = (argsStr) => invokeQuery(handler, argsStr);
  func.exportArgs = exportArgs(functionDefinition);
  func.exportReturns = exportReturns(functionDefinition);
  func._handler = handler;
  return func;
};
async function invokeAction(func, requestId, argsStr) {
  const args = jsonToConvex(JSON.parse(argsStr));
  const calls = setupActionCalls(requestId);
  const ctx = {
    ...calls,
    auth: setupAuth(requestId),
    scheduler: setupActionScheduler(requestId),
    storage: setupStorageActionWriter(requestId),
    vectorSearch: setupActionVectorSearch(requestId)
  };
  const result = await invokeFunction(func, ctx, args);
  return JSON.stringify(convexToJson(result === void 0 ? null : result));
}
var actionGeneric = (functionDefinition) => {
  const handler = typeof functionDefinition === "function" ? functionDefinition : functionDefinition.handler;
  const func = dontCallDirectly("action", handler);
  assertNotBrowser();
  func.isAction = true;
  func.isPublic = true;
  func.invokeAction = (requestId, argsStr) => invokeAction(handler, requestId, argsStr);
  func.exportArgs = exportArgs(functionDefinition);
  func.exportReturns = exportReturns(functionDefinition);
  func._handler = handler;
  return func;
};
var internalActionGeneric = (functionDefinition) => {
  const handler = typeof functionDefinition === "function" ? functionDefinition : functionDefinition.handler;
  const func = dontCallDirectly("internalAction", handler);
  assertNotBrowser();
  func.isAction = true;
  func.isInternal = true;
  func.invokeAction = (requestId, argsStr) => invokeAction(handler, requestId, argsStr);
  func.exportArgs = exportArgs(functionDefinition);
  func.exportReturns = exportReturns(functionDefinition);
  func._handler = handler;
  return func;
};
async function invokeHttpAction(func, request) {
  const requestId = "";
  const calls = setupActionCalls(requestId);
  const ctx = {
    ...calls,
    auth: setupAuth(requestId),
    storage: setupStorageActionWriter(requestId),
    scheduler: setupActionScheduler(requestId),
    vectorSearch: setupActionVectorSearch(requestId)
  };
  return await invokeFunction(func, ctx, [request]);
}
var httpActionGeneric = (func) => {
  const q = dontCallDirectly("httpAction", func);
  assertNotBrowser();
  q.isHttp = true;
  q.invokeHttpAction = (request) => invokeHttpAction(func, request);
  q._handler = func;
  return q;
};
async function runUdf(udfType, f, args) {
  const queryArgs = parseArgs(args);
  const syscallArgs2 = {
    udfType,
    args: convexToJson(queryArgs),
    ...getFunctionAddress(f)
  };
  const result = await performAsyncSyscall("1.0/runUdf", syscallArgs2);
  return jsonToConvex(result);
}

// node_modules/convex/dist/esm/server/pagination.js
var paginationOptsValidator = v.object({
  numItems: v.number(),
  cursor: v.union(v.string(), v.null()),
  endCursor: v.optional(v.union(v.string(), v.null())),
  id: v.optional(v.number()),
  maximumRowsRead: v.optional(v.number()),
  maximumBytesRead: v.optional(v.number())
});

// node_modules/convex/dist/esm/server/cron.js
var __defProp10 = Object.defineProperty;
var __defNormalProp10 = (obj, key, value) => key in obj ? __defProp10(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField10 = (obj, key, value) => __defNormalProp10(obj, typeof key !== "symbol" ? key + "" : key, value);
var DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];
var cronJobs = () => new Crons();
function validateIntervalNumber(n) {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("Interval must be an integer greater than 0");
  }
}
function validatedDayOfMonth(n) {
  if (!Number.isInteger(n) || n < 1 || n > 31) {
    throw new Error("Day of month must be an integer from 1 to 31");
  }
  return n;
}
function validatedDayOfWeek(s) {
  if (!DAYS_OF_WEEK.includes(s)) {
    throw new Error('Day of week must be a string like "monday".');
  }
  return s;
}
function validatedHourOfDay(n) {
  if (!Number.isInteger(n) || n < 0 || n > 23) {
    throw new Error("Hour of day must be an integer from 0 to 23");
  }
  return n;
}
function validatedMinuteOfHour(n) {
  if (!Number.isInteger(n) || n < 0 || n > 59) {
    throw new Error("Minute of hour must be an integer from 0 to 59");
  }
  return n;
}
function validatedCronString(s) {
  return s;
}
function validatedCronIdentifier(s) {
  if (!s.match(/^[ -~]*$/)) {
    throw new Error(
      `Invalid cron identifier ${s}: use ASCII letters that are not control characters`
    );
  }
  return s;
}
var Crons = class {
  constructor() {
    __publicField10(this, "crons");
    __publicField10(this, "isCrons");
    this.isCrons = true;
    this.crons = {};
  }
  /** @internal */
  schedule(cronIdentifier, schedule, functionReference, args) {
    const cronArgs = parseArgs(args);
    validatedCronIdentifier(cronIdentifier);
    if (cronIdentifier in this.crons) {
      throw new Error(`Cron identifier registered twice: ${cronIdentifier}`);
    }
    this.crons[cronIdentifier] = {
      name: getFunctionName(functionReference),
      args: [convexToJson(cronArgs)],
      schedule
    };
  }
  /**
   * Schedule a mutation or action to run at some interval.
   *
   * ```js
   * crons.interval("Clear presence data", {seconds: 30}, api.presence.clear);
   * ```
   *
   * @param identifier - A unique name for this scheduled job.
   * @param schedule - The time between runs for this scheduled job.
   * @param functionReference - A {@link FunctionReference} for the function
   * to schedule.
   * @param args - The arguments to the function.
   */
  interval(cronIdentifier, schedule, functionReference, ...args) {
    const s = schedule;
    const hasSeconds = +("seconds" in s && s.seconds !== void 0);
    const hasMinutes = +("minutes" in s && s.minutes !== void 0);
    const hasHours = +("hours" in s && s.hours !== void 0);
    const total = hasSeconds + hasMinutes + hasHours;
    if (total !== 1) {
      throw new Error("Must specify one of seconds, minutes, or hours");
    }
    if (hasSeconds) {
      validateIntervalNumber(schedule.seconds);
    } else if (hasMinutes) {
      validateIntervalNumber(schedule.minutes);
    } else if (hasHours) {
      validateIntervalNumber(schedule.hours);
    }
    this.schedule(
      cronIdentifier,
      { ...schedule, type: "interval" },
      functionReference,
      ...args
    );
  }
  /**
   * Schedule a mutation or action to run on an hourly basis.
   *
   * ```js
   * crons.hourly(
   *   "Reset high scores",
   *   {
   *     minuteUTC: 30,
   *   },
   *   api.scores.reset
   * )
   * ```
   *
   * @param cronIdentifier - A unique name for this scheduled job.
   * @param schedule - What time (UTC) each day to run this function.
   * @param functionReference - A {@link FunctionReference} for the function
   * to schedule.
   * @param args - The arguments to the function.
   */
  hourly(cronIdentifier, schedule, functionReference, ...args) {
    const minuteUTC = validatedMinuteOfHour(schedule.minuteUTC);
    this.schedule(
      cronIdentifier,
      { minuteUTC, type: "hourly" },
      functionReference,
      ...args
    );
  }
  /**
   * Schedule a mutation or action to run on a daily basis.
   *
   * ```js
   * crons.daily(
   *   "Reset high scores",
   *   {
   *     hourUTC: 17, // (9:30am Pacific/10:30am Daylight Savings Pacific)
   *     minuteUTC: 30,
   *   },
   *   api.scores.reset
   * )
   * ```
   *
   * @param cronIdentifier - A unique name for this scheduled job.
   * @param schedule - What time (UTC) each day to run this function.
   * @param functionReference - A {@link FunctionReference} for the function
   * to schedule.
   * @param args - The arguments to the function.
   */
  daily(cronIdentifier, schedule, functionReference, ...args) {
    const hourUTC = validatedHourOfDay(schedule.hourUTC);
    const minuteUTC = validatedMinuteOfHour(schedule.minuteUTC);
    this.schedule(
      cronIdentifier,
      { hourUTC, minuteUTC, type: "daily" },
      functionReference,
      ...args
    );
  }
  /**
   * Schedule a mutation or action to run on a weekly basis.
   *
   * ```js
   * crons.weekly(
   *   "Weekly re-engagement email",
   *   {
   *     dayOfWeek: "Tuesday",
   *     hourUTC: 17, // (9:30am Pacific/10:30am Daylight Savings Pacific)
   *     minuteUTC: 30,
   *   },
   *   api.emails.send
   * )
   * ```
   *
   * @param cronIdentifier - A unique name for this scheduled job.
   * @param schedule - What day and time (UTC) each week to run this function.
   * @param functionReference - A {@link FunctionReference} for the function
   * to schedule.
   */
  weekly(cronIdentifier, schedule, functionReference, ...args) {
    const dayOfWeek = validatedDayOfWeek(schedule.dayOfWeek);
    const hourUTC = validatedHourOfDay(schedule.hourUTC);
    const minuteUTC = validatedMinuteOfHour(schedule.minuteUTC);
    this.schedule(
      cronIdentifier,
      { dayOfWeek, hourUTC, minuteUTC, type: "weekly" },
      functionReference,
      ...args
    );
  }
  /**
   * Schedule a mutation or action to run on a monthly basis.
   *
   * Note that some months have fewer days than others, so e.g. a function
   * scheduled to run on the 30th will not run in February.
   *
   * ```js
   * crons.monthly(
   *   "Bill customers at ",
   *   {
   *     hourUTC: 17, // (9:30am Pacific/10:30am Daylight Savings Pacific)
   *     minuteUTC: 30,
   *     day: 1,
   *   },
   *   api.billing.billCustomers
   * )
   * ```
   *
   * @param cronIdentifier - A unique name for this scheduled job.
   * @param schedule - What day and time (UTC) each month to run this function.
   * @param functionReference - A {@link FunctionReference} for the function
   * to schedule.
   * @param args - The arguments to the function.
   */
  monthly(cronIdentifier, schedule, functionReference, ...args) {
    const day = validatedDayOfMonth(schedule.day);
    const hourUTC = validatedHourOfDay(schedule.hourUTC);
    const minuteUTC = validatedMinuteOfHour(schedule.minuteUTC);
    this.schedule(
      cronIdentifier,
      { day, hourUTC, minuteUTC, type: "monthly" },
      functionReference,
      ...args
    );
  }
  /**
   * Schedule a mutation or action to run on a recurring basis.
   *
   * Like the unix command `cron`, Sunday is 0, Monday is 1, etc.
   *
   * ```
   *  ┌─ minute (0 - 59)
   *  │ ┌─ hour (0 - 23)
   *  │ │ ┌─ day of the month (1 - 31)
   *  │ │ │ ┌─ month (1 - 12)
   *  │ │ │ │ ┌─ day of the week (0 - 6) (Sunday to Saturday)
   * "* * * * *"
   * ```
   *
   * @param cronIdentifier - A unique name for this scheduled job.
   * @param cron - Cron string like `"15 7 * * *"` (Every day at 7:15 UTC)
   * @param functionReference - A {@link FunctionReference} for the function
   * to schedule.
   * @param args - The arguments to the function.
   */
  cron(cronIdentifier, cron, functionReference, ...args) {
    const c = validatedCronString(cron);
    this.schedule(
      cronIdentifier,
      { cron: c, type: "cron" },
      functionReference,
      ...args
    );
  }
  /** @internal */
  export() {
    return JSON.stringify(this.crons);
  }
};

// node_modules/convex/dist/esm/server/router.js
var __defProp11 = Object.defineProperty;
var __defNormalProp11 = (obj, key, value) => key in obj ? __defProp11(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField11 = (obj, key, value) => __defNormalProp11(obj, typeof key !== "symbol" ? key + "" : key, value);
var ROUTABLE_HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "OPTIONS",
  "PATCH"
];
function normalizeMethod(method) {
  if (method === "HEAD") return "GET";
  return method;
}
var httpRouter = () => new HttpRouter();
var HttpRouter = class {
  constructor() {
    __publicField11(this, "exactRoutes", /* @__PURE__ */ new Map());
    __publicField11(this, "prefixRoutes", /* @__PURE__ */ new Map());
    __publicField11(this, "isRouter", true);
    __publicField11(this, "route", (spec) => {
      if (!spec.handler) throw new Error(`route requires handler`);
      if (!spec.method) throw new Error(`route requires method`);
      const { method, handler } = spec;
      if (!ROUTABLE_HTTP_METHODS.includes(method)) {
        throw new Error(
          `'${method}' is not an allowed HTTP method (like GET, POST, PUT etc.)`
        );
      }
      if ("path" in spec) {
        if ("pathPrefix" in spec) {
          throw new Error(
            `Invalid httpRouter route: cannot contain both 'path' and 'pathPrefix'`
          );
        }
        if (!spec.path.startsWith("/")) {
          throw new Error(`path '${spec.path}' does not start with a /`);
        }
        const methods = this.exactRoutes.has(spec.path) ? this.exactRoutes.get(spec.path) : /* @__PURE__ */ new Map();
        if (methods.has(method)) {
          throw new Error(
            `Path '${spec.path}' for method ${method} already in use`
          );
        }
        methods.set(method, handler);
        this.exactRoutes.set(spec.path, methods);
      } else if ("pathPrefix" in spec) {
        if (!spec.pathPrefix.startsWith("/")) {
          throw new Error(
            `pathPrefix '${spec.pathPrefix}' does not start with a /`
          );
        }
        if (!spec.pathPrefix.endsWith("/")) {
          throw new Error(`pathPrefix ${spec.pathPrefix} must end with a /`);
        }
        const prefixes = this.prefixRoutes.get(method) || /* @__PURE__ */ new Map();
        if (prefixes.has(spec.pathPrefix)) {
          throw new Error(
            `${spec.method} pathPrefix ${spec.pathPrefix} is already defined`
          );
        }
        prefixes.set(spec.pathPrefix, handler);
        this.prefixRoutes.set(method, prefixes);
      } else {
        throw new Error(
          `Invalid httpRouter route entry: must contain either field 'path' or 'pathPrefix'`
        );
      }
    });
    __publicField11(this, "getRoutes", () => {
      const exactPaths = [...this.exactRoutes.keys()].sort();
      const exact = exactPaths.flatMap(
        (path) => [...this.exactRoutes.get(path).keys()].sort().map(
          (method) => [path, method, this.exactRoutes.get(path).get(method)]
        )
      );
      const prefixPathMethods = [...this.prefixRoutes.keys()].sort();
      const prefixes = prefixPathMethods.flatMap(
        (method) => [...this.prefixRoutes.get(method).keys()].sort().map(
          (pathPrefix) => [
            `${pathPrefix}*`,
            method,
            this.prefixRoutes.get(method).get(pathPrefix)
          ]
        )
      );
      return [...exact, ...prefixes];
    });
    __publicField11(this, "lookup", (path, method) => {
      var _a;
      method = normalizeMethod(method);
      const exactMatch = (_a = this.exactRoutes.get(path)) == null ? void 0 : _a.get(method);
      if (exactMatch) return [exactMatch, method, path];
      const prefixes = this.prefixRoutes.get(method) || /* @__PURE__ */ new Map();
      const prefixesSorted = [...prefixes.entries()].sort(
        ([prefixA, _a2], [prefixB, _b]) => prefixB.length - prefixA.length
      );
      for (const [pathPrefix, endpoint] of prefixesSorted) {
        if (path.startsWith(pathPrefix)) {
          return [endpoint, method, `${pathPrefix}*`];
        }
      }
      return null;
    });
    __publicField11(this, "runRequest", async (argsStr, requestRoute) => {
      const request = performJsSyscall("requestFromConvexJson", {
        convexJson: JSON.parse(argsStr)
      });
      let pathname = requestRoute;
      if (!pathname || typeof pathname !== "string") {
        pathname = new URL(request.url).pathname;
      }
      const method = request.method;
      const match = this.lookup(pathname, method);
      if (!match) {
        const response2 = new Response(`No HttpAction routed for ${pathname}`, {
          status: 404
        });
        return JSON.stringify(
          performJsSyscall("convexJsonFromResponse", { response: response2 })
        );
      }
      const [endpoint, _method, _path] = match;
      const response = await endpoint.invokeHttpAction(request);
      return JSON.stringify(
        performJsSyscall("convexJsonFromResponse", { response })
      );
    });
  }
};

// node_modules/convex/dist/esm/server/components/index.js
var __defProp12 = Object.defineProperty;
var __defNormalProp12 = (obj, key, value) => key in obj ? __defProp12(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField12 = (obj, key, value) => __defNormalProp12(obj, typeof key !== "symbol" ? key + "" : key, value);
async function createFunctionHandle(functionReference) {
  const address = getFunctionAddress(functionReference);
  return await performAsyncSyscall("1.0/createFunctionHandle", {
    ...address,
    version
  });
}
var InstalledComponent = class {
  constructor(definition, name) {
    __publicField12(this, "_definition");
    __publicField12(this, "_name");
    this._definition = definition;
    this._name = name;
    setReferencePath(this, `_reference/childComponent/${name}`);
  }
  get exports() {
    return createExports(this._name, []);
  }
};
function createExports(name, pathParts) {
  const handler = {
    get(_, prop) {
      if (typeof prop === "string") {
        const newParts = [...pathParts, prop];
        return createExports(name, newParts);
      } else if (prop === toReferencePath) {
        let reference = `_reference/childComponent/${name}`;
        for (const part of pathParts) {
          reference += `/${part}`;
        }
        return reference;
      } else {
        return void 0;
      }
    }
  };
  return new Proxy({}, handler);
}
function use(definition, options) {
  const importedComponentDefinition = definition;
  if (typeof importedComponentDefinition.componentDefinitionPath !== "string") {
    throw new Error(
      "Component definition does not have the required componentDefinitionPath property. This code only works in Convex runtime."
    );
  }
  const name = (options == null ? void 0 : options.name) || // added recently
  importedComponentDefinition.defaultName || // can be removed once backend is out
  importedComponentDefinition.componentDefinitionPath.split("/").pop();
  this._childComponents.push([name, importedComponentDefinition, {}]);
  return new InstalledComponent(definition, name);
}
function exportAppForAnalysis() {
  const definitionType = { type: "app" };
  const childComponents = serializeChildComponents(this._childComponents);
  return {
    definitionType,
    childComponents,
    httpMounts: {},
    exports: serializeExportTree(this._exportTree)
  };
}
function serializeExportTree(tree) {
  const branch = [];
  for (const [key, child] of Object.entries(tree)) {
    let node;
    if (typeof child === "string") {
      node = { type: "leaf", leaf: child };
    } else {
      node = serializeExportTree(child);
    }
    branch.push([key, node]);
  }
  return { type: "branch", branch };
}
function serializeChildComponents(childComponents) {
  return childComponents.map(([name, definition, p]) => {
    let args = null;
    if (p !== null) {
      args = [];
      for (const [name2, value] of Object.entries(p)) {
        if (value !== void 0) {
          args.push([
            name2,
            { type: "value", value: JSON.stringify(convexToJson(value)) }
          ]);
        }
      }
    }
    const path = definition.componentDefinitionPath;
    if (!path)
      throw new Error(
        "no .componentPath for component definition " + JSON.stringify(definition, null, 2)
      );
    return {
      name,
      path,
      args
    };
  });
}
function exportComponentForAnalysis() {
  const args = Object.entries(
    this._args
  ).map(([name, validator]) => [
    name,
    {
      type: "value",
      value: JSON.stringify(validator.json)
    }
  ]);
  const definitionType = {
    type: "childComponent",
    name: this._name,
    args
  };
  const childComponents = serializeChildComponents(this._childComponents);
  return {
    name: this._name,
    definitionType,
    childComponents,
    httpMounts: {},
    exports: serializeExportTree(this._exportTree)
  };
}
function defineComponent(name) {
  const ret = {
    _isRoot: false,
    _name: name,
    _args: {},
    _childComponents: [],
    _exportTree: {},
    _onInitCallbacks: {},
    export: exportComponentForAnalysis,
    use,
    // pretend to conform to ComponentDefinition, which temporarily expects __args
    ...{}
  };
  return ret;
}
function defineApp() {
  const ret = {
    _isRoot: true,
    _childComponents: [],
    _exportTree: {},
    export: exportAppForAnalysis,
    use
  };
  return ret;
}
function currentSystemUdfInComponent(componentId) {
  return {
    [toReferencePath]: `_reference/currentSystemUdfInComponent/${componentId}`
  };
}
function createChildComponents(root, pathParts) {
  const handler = {
    get(_, prop) {
      if (typeof prop === "string") {
        const newParts = [...pathParts, prop];
        return createChildComponents(root, newParts);
      } else if (prop === toReferencePath) {
        if (pathParts.length < 1) {
          const found = [root, ...pathParts].join(".");
          throw new Error(
            `API path is expected to be of the form \`${root}.childComponent.functionName\`. Found: \`${found}\``
          );
        }
        return `_reference/childComponent/` + pathParts.join("/");
      } else {
        return void 0;
      }
    }
  };
  return new Proxy({}, handler);
}
var componentsGeneric = () => createChildComponents("components", []);

// node_modules/convex/dist/esm/server/schema.js
var __defProp13 = Object.defineProperty;
var __defNormalProp13 = (obj, key, value) => key in obj ? __defProp13(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField13 = (obj, key, value) => __defNormalProp13(obj, typeof key !== "symbol" ? key + "" : key, value);
var TableDefinition = class {
  /**
   * @internal
   */
  constructor(documentType) {
    __publicField13(this, "indexes");
    __publicField13(this, "searchIndexes");
    __publicField13(this, "vectorIndexes");
    __publicField13(this, "validator");
    this.indexes = [];
    this.searchIndexes = [];
    this.vectorIndexes = [];
    this.validator = documentType;
  }
  /**
   * Define an index on this table.
   *
   * To learn about indexes, see [Defining Indexes](https://docs.convex.dev/using/indexes).
   *
   * @param name - The name of the index.
   * @param fields - The fields to index, in order. Must specify at least one
   * field.
   * @returns A {@link TableDefinition} with this index included.
   */
  index(name, fields) {
    this.indexes.push({ indexDescriptor: name, fields });
    return this;
  }
  /**
   * Define a search index on this table.
   *
   * To learn about search indexes, see [Search](https://docs.convex.dev/text-search).
   *
   * @param name - The name of the index.
   * @param indexConfig - The search index configuration object.
   * @returns A {@link TableDefinition} with this search index included.
   */
  searchIndex(name, indexConfig) {
    this.searchIndexes.push({
      indexDescriptor: name,
      searchField: indexConfig.searchField,
      filterFields: indexConfig.filterFields || []
    });
    return this;
  }
  /**
   * Define a vector index on this table.
   *
   * To learn about vector indexes, see [Vector Search](https://docs.convex.dev/vector-search).
   *
   * @param name - The name of the index.
   * @param indexConfig - The vector index configuration object.
   * @returns A {@link TableDefinition} with this vector index included.
   */
  vectorIndex(name, indexConfig) {
    this.vectorIndexes.push({
      indexDescriptor: name,
      vectorField: indexConfig.vectorField,
      dimensions: indexConfig.dimensions,
      filterFields: indexConfig.filterFields || []
    });
    return this;
  }
  /**
   * Work around for https://github.com/microsoft/TypeScript/issues/57035
   */
  self() {
    return this;
  }
  /**
   * Export the contents of this definition.
   *
   * This is called internally by the Convex framework.
   * @internal
   */
  export() {
    return {
      indexes: this.indexes,
      searchIndexes: this.searchIndexes,
      vectorIndexes: this.vectorIndexes,
      documentType: this.validator.json
    };
  }
};
function defineTable(documentSchema) {
  if (isValidator(documentSchema)) {
    return new TableDefinition(documentSchema);
  } else {
    return new TableDefinition(v.object(documentSchema));
  }
}
var SchemaDefinition = class {
  /**
   * @internal
   */
  constructor(tables, options) {
    __publicField13(this, "tables");
    __publicField13(this, "strictTableNameTypes");
    __publicField13(this, "schemaValidation");
    this.tables = tables;
    this.schemaValidation = (options == null ? void 0 : options.schemaValidation) === void 0 ? true : options.schemaValidation;
  }
  /**
   * Export the contents of this definition.
   *
   * This is called internally by the Convex framework.
   * @internal
   */
  export() {
    return JSON.stringify({
      tables: Object.entries(this.tables).map(([tableName, definition]) => {
        const { indexes, searchIndexes, vectorIndexes, documentType } = definition.export();
        return {
          tableName,
          indexes,
          searchIndexes,
          vectorIndexes,
          documentType
        };
      }),
      schemaValidation: this.schemaValidation
    });
  }
};
function defineSchema(schema, options) {
  return new SchemaDefinition(schema, options);
}
var _systemSchema = defineSchema({
  _scheduled_functions: defineTable({
    name: v.string(),
    args: v.array(v.any()),
    scheduledTime: v.float64(),
    completedTime: v.optional(v.float64()),
    state: v.union(
      v.object({ kind: v.literal("pending") }),
      v.object({ kind: v.literal("inProgress") }),
      v.object({ kind: v.literal("success") }),
      v.object({ kind: v.literal("failed"), error: v.string() }),
      v.object({ kind: v.literal("canceled") })
    )
  }),
  _storage: defineTable({
    sha256: v.string(),
    size: v.float64(),
    contentType: v.optional(v.string())
  })
});
export {
  HttpRouter,
  ROUTABLE_HTTP_METHODS,
  SearchFilter,
  actionGeneric,
  anyApi,
  componentsGeneric,
  createFunctionHandle,
  cronJobs,
  currentSystemUdfInComponent,
  defineApp,
  defineComponent,
  defineSchema,
  defineTable,
  filterApi,
  getFunctionAddress,
  getFunctionName,
  httpActionGeneric,
  httpRouter,
  internalActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
  makeFunctionReference,
  mutationGeneric,
  paginationOptsValidator,
  queryGeneric
};
//# sourceMappingURL=convex_server.js.map
