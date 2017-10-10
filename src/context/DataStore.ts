import {
  Immutable
} from 'seamless-immutable';

import {
  SolrResponse
} from './Data';

function escape(value: String) {
  return value;
}

class SolrQueryBuilder<T> {
  searchResponse?: SolrResponse<T>;

  prior?: SolrQueryBuilder<T>;
  op: () => String;

  constructor(op: () => String, previous?: SolrQueryBuilder<T>) {
    this.prior = previous;
    this.op = op;
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
      this.prior ? this.prior.op() + '&' + this.op() :
      this.op() + '&wt=json'
    );
  }
}

type SelectEvent<T> = (response: SolrResponse<T>) => void;
type ErrorEvent = (status: number, body: string) => void;

class DataStore<T> {
  private url: string;
  private core: string;
  private events: {
    select: SelectEvent<T>[],
    error: ErrorEvent[]
  };

  constructor(url: string, core: string) {
    this.url = url;
    this.core = core;
    this.events = {
      select: [],
      error: []
    };
  }

  onSelect(op: SelectEvent<T>) {
    this.events.select.concat(op);
  }

  onError(op: ErrorEvent) {
    this.events.error.concat(op);
  }

  next(op: (event: SolrQueryBuilder<T>) => SolrQueryBuilder<T>) {
    const qb = 
      op(
        new SolrQueryBuilder(() => '', undefined)
      );

    const url = this.url + this.core + '/select?' + qb.build();
    fetch(url).then(
      (data) => {
        if (data.status !== 200) {
          this.events.error.map(
            (event) => event(data.status, data.body + '')
          );
        } else {
          this.events.select.map(
            (event) => event(Immutable(JSON.parse(data.body + '')))
          );
        }
      }
    );    
  }
}

export { 
  DataStore,
  SolrQueryBuilder
};