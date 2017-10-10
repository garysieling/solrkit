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

  get(id: string) {
    return new SolrQueryBuilder<T>(
      () => 'get?id=' + id,
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
    return (
      this.previous ? (
        this.previous.previous ? (
          this.previous.op() + '&' + this.op() 
        ) : this.op()
      ) : (
        this.op() + '&wt=json'
      )
    );
  }
}

type SelectEvent<T> = (response: SolrResponse<T>) => void;
type ErrorEvent = (error: object) => void;
type GetEvent<T> = (object: T) => void;

class DataStore<T> {
  private url: string;
  private core: string;
  private events: {
    select: SelectEvent<T>[],
    error: ErrorEvent[],
    get: GetEvent<T>[]
  };

  private requestId: number = 0;

  constructor(url: string, core: string) {
    this.url = url;
    this.core = core;
    this.events = {
      select: [],
      error: [],
      get: []
    };
  }

  onSelect(op: SelectEvent<T>) {
    this.events.select.push(op);
  }

  onError(op: ErrorEvent) {
    this.events.error.push(op);
  }

  onGet(op: GetEvent<T>) {
    this.events.get.push(op);
  }

  get(id: string) {
    const self = this;
    const callback = 'cb_' + this.requestId++;

    const qb = 
      new SolrQueryBuilder(() => '').get(
        id
      ).jsonp(
        callback
      );

    const url = this.url + this.core + '/' + qb.build();

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
      );

    const url = this.url + this.core + '/select?' + qb.build();
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

export { 
  DataStore,
  SolrQueryBuilder
};