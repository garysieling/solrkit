import {
  Immutable
} from 'seamless-immutable';

import {
  SolrResponse
} from './Data';

import * as fetchJsonp from 'fetch-jsonp';

function escape(value: String) {
  return value;
}

class SolrQueryBuilder<T> {
  searchResponse?: SolrResponse<T>;

  previous?: SolrQueryBuilder<T>;
  op: () => String;

  constructor(op: () => String, previous?: SolrQueryBuilder<T>) {
    this.op = op;
    this.previous = previous;    
  }

  get(id: string | number) {
    return new SolrQueryBuilder<T>(
      () => 'get?id=' + id,
      this
    );
  }
  
  moreLikeThis(handler: string, col: string, id: string | number) {
    return new SolrQueryBuilder<T>(
      () => handler + '/get?q=' + col + ':' + id,
      this
    );
  }

  jsonp(callback: string) {
    return new SolrQueryBuilder<T>(
      () => 'wt=json&json.wrf=' + callback,
      this
    );
  }

  q(field: String, value: String) {
    return new SolrQueryBuilder<T>(
      () => 'q=' + escape(field) + ':' + escape(value),
      this
    );
  }

  fq(field: String, value: String) {
    return new SolrQueryBuilder<T>(
      () => 'fq=' + escape(field) + ':' + escape(value),
      this
    );
  }

  fl(fields: string[]) {
    return new SolrQueryBuilder<T>(
      () => 'fl=' + fields.map(escape).join(','),
      this
    );
  }
  
  sort(fields: string[]) {
    return new SolrQueryBuilder<T>(
      () => 'sort=' + fields.map(escape).join(','),
      this
    );
  }

  build() {
    let start = '';
    if (this.previous) {
      start = this.previous.build();
    }

    if (start !== '') {
      start = start + '&';
    }

    start = start + this.op();

    return start;
  }
}

type QueryEvent<T> = (response: SolrResponse<T>) => void;
type ErrorEvent = (error: object) => void;
type GetEvent<T> = (object: T) => void;
type MoreLikeThisEvent<T> = (object: T[]) => void;

interface SolrGet<T> {
  doGet: (id: string | number) => void;
  onGet: (cb: GetEvent<T>) => void;
}

interface SolrQuery<T> {
  doQuery: (q: GenericSolrQuery) => void;
  onQuery: (cb: QueryEvent<T>) => void;
}

interface SolrMoreLikeThis<T> {
  doMoreLikeThis: (id: string | number) => void;
  onMoreLikeThis: (cb: MoreLikeThisEvent<T>) => void;
}

// TODO - this needs a lot more definition to be useful
interface GenericSolrQuery {
  field: string;
  value: string;
}

interface SolrConfig {
  url: string;
  core: string;
  primaryKey: string;
  fields: string[];
}

class SolrCore<T> {
  solrConfig: SolrConfig;
  private events: {
    select: QueryEvent<T>[],
    error: ErrorEvent[],
    get: GetEvent<T>[],
    mlt: MoreLikeThisEvent<T>[],
  };

  private requestId: number = 0;

  private cache = {};
  memoize(fn: Function) {
    const name = fn.name;
    return (...args) => {
      const key = name + ' ' + args.join(' ');
      let result = this.cache[key];
      if (result) {
        return result;
      }

      result = fn.call(args);

      this.cache[key] = result;

      return result;
    };
  }

  constructor(solrConfig: SolrConfig) {
    this.solrConfig = solrConfig;
    this.events = {
      select: [],
      error: [],
      get: [],
      mlt: []
    };

    this.onGet = this.memoize(this.onGet);
  }

  onQuery(op: QueryEvent<T>) {
    this.events.select.push(op);
  }

  onError(op: ErrorEvent) {
    this.events.error.push(op);
  }

  doMoreLikeThis(id: string | number) {
    const self = this;
    const callback = 'cb_' + this.requestId++;

    const qb = 
      new SolrQueryBuilder(() => '').moreLikeThis(
        'mlt', // TODO - configurable
        this.solrConfig.primaryKey,
        id
      ).fl(this.solrConfig.fields).jsonp(
        callback
      );

    const url = this.solrConfig.url + this.solrConfig.core + '/' + qb.build();

    fetchJsonp(url, {
      jsonpCallbackFunction: callback
    }).then(
      (data) => {
        data.json().then( 
          (responseData) => {
            self.events.mlt.map(
              (event) => event(responseData.docs)
            );
          }
        ).catch(
          (error) => {
            self.events.error.map(
              (event) => event(error)
            );
          }
        );
      }
    );    
  }

  onMoreLikeThis(op: (v: T[]) => void) {
    this.events.mlt.push(op);
  }

  onGet(op: GetEvent<T>) {
    this.events.get.push(op);
  }
  
  doGet(id: string | number) {
    const self = this;
    const callback = 'cb_' + this.requestId++;

    const qb = 
      new SolrQueryBuilder(() => '').get(
        id
      ).fl(this.solrConfig.fields).jsonp(
        callback
      );

    const url = this.solrConfig.url + this.solrConfig.core + '/' + qb.build();

    fetchJsonp(url, {
      jsonpCallbackFunction: callback
    }).then(
      (data) => {
        data.json().then( 
          (responseData) => {
            self.events.get.map(
              (event) => event(responseData.doc)
            );
          }
        ).catch(
          (error) => {
            self.events.error.map(
              (event) => event(error)
            );
          }
        );
      }
    );    
  }

  // TODO - this thing needs a lot more definition to be useful
  doQuery(query: GenericSolrQuery) {
    const self = this;
    const callback = 'cb_' + this.requestId++;

    const qb = 
      new SolrQueryBuilder(() => '').q(
        query.field,
        query.value
      ).fl(this.solrConfig.fields).jsonp(
        callback
      );

    const url = this.solrConfig.url + this.solrConfig.core + '/' + qb.build();

    fetchJsonp(url, {
      jsonpCallbackFunction: callback
    }).then(
      (data) => {
        data.json().then( 
          (responseData) => {
            self.events.get.map(
              (event) => event(responseData.doc)
            );
          }
        ).catch(
          (error) => {
            self.events.error.map(
              (event) => event(error)
            );
          }
        );
      }
    );    
  }

  next(op: (event: SolrQueryBuilder<T>) => SolrQueryBuilder<T>) {
    const qb = 
      op(
        new SolrQueryBuilder(() => '')
      ).fl(this.solrConfig.fields);

    const url = this.solrConfig.url + this.solrConfig.core + '/select?' + qb.build();
    fetchJsonp(url).then(
      (data) => {
        data.json().catch(
          (error) => {
          this.events.error.map(
            (event) => event(error)
          );
          }
        ).then( 
          (responseData) => {
            this.events.get.map(
              (event) => event(Immutable(responseData).doc)
            );
          }
        );
      }
    );    
  }
}

// TODO: I want a way to auto-generate these from Solr management APIs
// TODO: This thing should provide some reflection capability so the
//       auto-registered version can be used to bind controls through
//       a properties picker UI
class DataStore {
  cores: { [ keys: string ]: object }  ;

  registerCore<T>(config: SolrConfig): SolrCore<T> {
    // Check if this exists - Solr URL + core should be enough
    let key = config.url;
    
    if (!key.endsWith('/')) {
      key += '/';
    }

    key += config.core;

    if (!this.cores[key]) {
      this.cores[key] = new SolrCore<T>(config);
    }

    return (this.cores[key] as SolrCore<T>);
  }
}

type SingleComponent<T> =
  (data: T) => object;

export { 
  SolrQueryBuilder,
  SingleComponent,
  DataStore,
  SolrCore, 
  SolrGet, 
  SolrMoreLikeThis, 
  SolrQuery
};