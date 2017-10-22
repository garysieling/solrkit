import Immutable from 'seamless-immutable';

import {
  SolrResponse
} from './Data';

import * as fetchJsonp from 'fetch-jsonp';
import * as _ from 'lodash';

function escape(value: QueryParam): string {
  return value + '';
}

// Note that the stored versions of these end up namespaced and/or aliased
enum UrlParams {
  ID = 'id',
  QUERY = 'query',
  FQ = 'fq',
  START = 'start',
  TYPE = 'type'
}

interface SearchParams {
  type?: 'QUERY' | 'MLT' | 'DETAILS';
  query?: string;
  start?: number;
  facets?: { [ key: string ]: string[] };
}

type QueryParam = string | number;
type NamespacedUrlParam = [UrlParams, QueryParam];
type UrlFragment = [UrlParams | NamespacedUrlParam, QueryParam | [string, QueryParam[]]] | null; // k, v

class QueryBeingBuilt {
  solrUrlFragment: string;
  appUrlFragment: UrlFragment;

  constructor(solrUrlFragment: string, appUrlFragment: UrlFragment) {
    this.solrUrlFragment = solrUrlFragment;

    // TODO, these need to support the following:
    //    aliasing multiple parameters (i.e. any of the following values could be a 'q')
    //        this supports renames over time
    //    urls in the path or the query 
    //         this is for seo
    //    aliasing groups of parameters (this is like the named search example)
    //    numeric indexes - e.g. fq
    //    facets should have some special handling;
    //         facets can be arrays
    //         facets can be hierarchies (probably there are different implementations of this)
    //    "named" values that wrap sets of parameters - e.g named sort fields or enum queries
    //    need to be able to namespace the output of this to be unique to support multiple searches on a site
    //    this needs to work 100% bidirectional (i.e. url -> objects, objects -> url)
    this.appUrlFragment = appUrlFragment;
  }
}

class SolrQueryBuilder<T> {
  searchResponse?: SolrResponse<T>;

  previous?: SolrQueryBuilder<T>;
  op: () => QueryBeingBuilt;

  constructor(op: () => QueryBeingBuilt, previous?: SolrQueryBuilder<T>) {
    this.op = op;
    this.previous = previous;    
  }

  get(id: QueryParam) {
    return new SolrQueryBuilder<T>(
      () => new QueryBeingBuilt('get?id=' + id, [UrlParams.ID, id]),
      this
    );
  }

  select() {
    return new SolrQueryBuilder<T>(
      () => new QueryBeingBuilt('select?facet=true', [UrlParams.TYPE, 'QUERY']),
      this
    );
  }  
  
  moreLikeThis(handler: string, col: string, id: QueryParam) {
    return new SolrQueryBuilder<T>(
      () => new QueryBeingBuilt(handler + '?q=' + col + ':' + id, [UrlParams.ID, id]),
      this
    );
  }
  
  start(start: number) {
    return new SolrQueryBuilder<T>(
      () => new QueryBeingBuilt('start=' + start, [UrlParams.START, start]),
      this
    );
  }

  jsonp(callback: string) {
    return new SolrQueryBuilder<T>(
      () => new QueryBeingBuilt('wt=json&json.wrf=' + callback, null),
      this
    );
  }

  q(searchFields: string[], value: QueryParam) {
    return new SolrQueryBuilder<T>(
      () => 
        new QueryBeingBuilt(
          'q=' +
            searchFields.map(
              (field) => escape(field) + ':' + escape(value)
            ).join('%20OR%20'),
          [UrlParams.QUERY, value]
        )
      ,
      this
    );
  }

  fq(field: string, values: QueryParam[]) {
    return new SolrQueryBuilder<T>(
      () => {
        return new QueryBeingBuilt(
          'fq=' + escape(field) + ':' + values.map(escape).join('%20OR%20'),
          [UrlParams.FQ, [field, values]]
        );
      },
      this
    );
  }

  fl(fields: QueryParam[]) {
    return new SolrQueryBuilder<T>(
      () => 
        new QueryBeingBuilt(
          'fl=' + fields.map(escape).join(','),
          null
        ),
      this
    );
  }

  requestFacet(field: string) {
    return new SolrQueryBuilder<T>(
      () => 
        new QueryBeingBuilt(
          `facet.field={!ex=${field}_q}${field}&` + 
          `facet.mincount=1&` +
          `facet.${field}.limit=50&` +
          `facet.${field}.sort=count`,
          null
        ),
      this
    );
  }

  rows(rows: number) {
    return new SolrQueryBuilder<T>(
      () => 
        new QueryBeingBuilt(
          'rows=' + rows,
          null
        ),
      this
    );
  }
  
  sort(fields: string[]) {
    return new SolrQueryBuilder<T>(
      () => 
        new QueryBeingBuilt(
          'sort=' + fields.map(escape).join(','),
          // TODO: I think this should add a 'named sort' to the URL, because
          // this could have a large amount of Solr specific stuff in it - i.e.
          // add(field1, mul(field2, field3)) and you don't want to expose the
          // internals to external search engines, or they'll index the site in
          // a way that would make this hard to change
          null
        ),
      this
    );
  }

  construct(): [string, Array<UrlFragment>] {
    let start: [string, Array<UrlFragment>] = ['', []];
    if (this.previous) {
      start = this.previous.construct();
    }

    if (start[0] !== '') {
      start[0] = start[0] + '&';
    }

    const output = this.op();

    return [
      start[0] + output.solrUrlFragment,
      start[1].concat([output.appUrlFragment])
    ];
  }

  buildCurrentParameters(): SearchParams {
    const initialParams = this.construct()[1];
    const result: Array<UrlFragment> = initialParams;
    
    const searchParams: SearchParams = {      
    };

    result.map(
      (p: UrlFragment) => {
        if (p !== null) {
          if (p[0] === UrlParams.FQ) {
            const facet = p[1][0];
            const values = p[1][1];

            if (!searchParams.facets) {
              searchParams.facets = {};
            }

            searchParams.facets[facet] = values;
          } else {
            searchParams[p[0] as string] = p[1];
          }
        }
      }
    );

    return searchParams;
  }

  buildSolrUrl() {
    return this.construct()[0];
  }
}

interface PaginationData {
  numFound: number;
  start: number;
  pageSize: number;
}

type QueryEvent<T> = (object: T[], paging: PaginationData) => void;
type FacetEvent = (object: [string, number, boolean][]) => void;
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
  registerFacet: (facet: string[]) => (cb: FacetEvent) => void;
}

interface SolrMoreLikeThis<T> {
  doMoreLikeThis: (id: string | number) => void;
  onMoreLikeThis: (cb: MoreLikeThisEvent<T>) => void;
}

interface SolrTransitions {
  getCoreConfig: () => SolrConfig;
  getNamespace: () => string;
  getCurrentParameters: () => SearchParams;
  stateTransition: (v: SearchParams) => void;
}

// TODO - this needs a lot more definition to be useful
interface GenericSolrQuery {
  query: string;
  rows?: number;
}

interface SolrConfig {
  url: string;
  core: string;
  primaryKey: string;
  defaultSearchFields: string[];
  fields: string[];
  pageSize: number;
}

class SolrCore<T> implements SolrTransitions {
  solrConfig: SolrConfig;
  private events: {
    query: QueryEvent<T>[],
    error: ErrorEvent[],
    get: GetEvent<T>[],
    mlt: MoreLikeThisEvent<T>[],
    facet: { [key: string]: FacetEvent[] };
  };

  private requestId: number = 0;
  private currentParameters: SearchParams = {};
  
  private getCache = {};
  private mltCache = {};

  constructor(solrConfig: SolrConfig) {
    this.solrConfig = solrConfig;
    this.clearEvents();

    // this.onGet = this.memoize(this.onGet);
  }

  clearEvents() {
    this.events = {
      query: [],
      error: [],
      get: [],
      mlt: [],
      facet: {}
    };

    if (_.keys(this.getCache).length > 100) {
      this.getCache = {};
    }
    
    if (_.keys(this.mltCache).length > 100) {
      this.mltCache = {};
    }
  }

  getCoreConfig() {
    return this.solrConfig;
  }

  onQuery(op: QueryEvent<T>) {
    this.events.query.push(op);
  }

  registerFacet(facetNames: string[]) {
    const events = this.events.facet;
    
    return function facetBind(cb: FacetEvent) {
      // this works differently than the other event types because
      // you may not know in advance what all the facets should be
      facetNames.map(
        (facetName) => {
          events[facetName] = 
            (events[facetName] || []);
        
          events[facetName].push(cb);
        }
      );
      
    };
  }

  onError(op: ErrorEvent) {
    this.events.error.push(op);
  }

  doMoreLikeThis(id: string | number) {
    this.prefetchMoreLikeThis(id, true);
  }  

  getNamespace() {
    return '';
  }

  prefetchMoreLikeThis(id: string | number, prefetch: boolean) {
    const self = this;
   
    if (!self.mltCache[id]) {
      const callback = 'cb_' + self.requestId++;

      const qb = 
        new SolrQueryBuilder(
          () => new QueryBeingBuilt('', null)
        ).moreLikeThis(
          'mlt', // TODO - configurable
          self.solrConfig.primaryKey,
          id
        ).fl(self.solrConfig.fields).jsonp(
          callback
        );

      const url = self.solrConfig.url + self.solrConfig.core + '/' + qb.buildSolrUrl();

      fetchJsonp(url, {
        jsonpCallbackFunction: callback
      }).then(
        (data) => {
          data.json().then( 
            (responseData) => {
              const mlt = responseData.response.docs;
              if (prefetch) {
                self.events.mlt.map(
                  (event) => {
                    event(Immutable(mlt));
                  }
                );

                mlt.map(
                  (doc) => {
                    self.prefetchMoreLikeThis(
                      doc[this.solrConfig.primaryKey],
                      false
                    );
                  }
                );
              }
            
              responseData.response.docs.map(
                (doc) => self.getCache[id] = responseData.doc
              );

              self.mltCache[id] = responseData.response.docs;
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
    } else {
      self.events.mlt.map(
        (event) => {
          event(Immutable(this.mltCache[id]));
        }
      );
    }     
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
      new SolrQueryBuilder(() => new QueryBeingBuilt('', null)).get(
        id
      ).fl(this.solrConfig.fields).jsonp(
        callback
      );

    const url = this.solrConfig.url + this.solrConfig.core + '/' + qb.buildSolrUrl();

    if (!this.getCache[id]) {
      fetchJsonp(url, {
        jsonpCallbackFunction: callback
      }).then(
        (data) => {
          data.json().then( 
            (responseData) => {
              self.events.get.map(
                (event) => event(Immutable(responseData.doc))
              );

              this.getCache[id] = responseData.doc;
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
    } else {
      self.events.get.map(
        (event) => event(Immutable(this.getCache[id]))
      );
    }
  } 

  doQuery(query: GenericSolrQuery, cb?: (qb: SolrQueryBuilder<{}>) => SolrQueryBuilder<{}>)  {
    const self = this;
    const callback = 'cb_' + this.requestId++;

    let qb = 
      new SolrQueryBuilder(
        () => new QueryBeingBuilt('', null),
      ).select().q(
        this.solrConfig.defaultSearchFields,
        query.query
      ).fl(this.solrConfig.fields).rows(
        query.rows || this.solrConfig.pageSize
      );

    _.map(
      this.events.facet,
      (v, k) => {
        qb = qb.requestFacet(k);
      }
    );
    
    if (cb) {
     qb = cb(qb); 
    }
      
    qb = qb.jsonp(
      callback
    );

    const url = this.solrConfig.url + this.solrConfig.core + '/' + qb.buildSolrUrl();

    fetchJsonp(url, {
      jsonpCallbackFunction: callback
    }).then(
      (data) => {
        this.currentParameters = qb.buildCurrentParameters();

        data.json().then( 
          (responseData) => {           
            self.events.query.map(
              (event) => 
                event(
                  Immutable(responseData.response.docs),
                  Immutable({
                    numFound: responseData.response.numFound,
                    start: responseData.response.start,
                    pageSize: query.rows || 10
                  })
                )
              );

            const facetCounts = responseData.facet_counts;
            if (facetCounts) {
              const facetFields = facetCounts.facet_fields;
              if (facetFields) {
                _.map(
                  self.events.facet,
                  (events, k) => {
                    if (facetFields[k]) {
                      const previousValues = (this.currentParameters.facets || {})[k];

                      const facetLabels = facetFields[k].filter( (v, i) => i % 2 === 0 );
                      const facetLabelCount = facetFields[k].filter( (v, i) => i % 2 === 1 );
                      const facetSelections = facetLabels.map(
                        (value) => _.includes(previousValues, value)
                      );

                      events.map(
                        (event) => {
                          event(_.zipWith(facetLabels, facetLabelCount, facetSelections));
                        }
                      );
                    }
                  }
                );
              }
            }
            
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
    const self = this;

    const qb = 
      op(
        new SolrQueryBuilder<T>(
          () => new QueryBeingBuilt('', null)
        )
      ).fl(self.solrConfig.fields);

    const url = self.solrConfig.url + self.solrConfig.core + '/select?' + qb.buildSolrUrl();

    fetchJsonp(url).then(
      (data) => {
        data.json().catch(
          (error) => {
          self.events.error.map(
            (event) => event(error)
          );
          }
        ).then( 
          (responseData) => {
            self.events.get.map(
              (event) => event(Immutable(responseData.response.docs))
            );
          }
        );
      }
    );    
  }

  stateTransition(newState: SearchParams) {
    if (newState.type === 'QUERY') {
      this.doQuery(
        {
          rows: this.solrConfig.pageSize,
          query: newState.query || '*'
        }, 
        (qb: SolrQueryBuilder<{}>) => {
          let response = qb.start(
            newState.start || 0
          );

          _.map(
            newState.facets,
            (values: string[], k: string) => {
              if (values.length > 0) {
                response =
                  response.fq(
                    k, values
                  );
              }
            }
          );

          return response;
        }
      );
    } else {
      throw 'INVALID STATE TRANSITION: ' + JSON.stringify(newState);
    }
  }

  getCurrentParameters(): SearchParams {
    return this.currentParameters;
  }
}

// TODO: I want a way to auto-generate these from Solr management APIs
// TODO: This thing should provide some reflection capability so the
//       auto-registered version can be used to bind controls through
//       a properties picker UI
class DataStore {
  cores: { [ keys: string ]: SolrCore<object> } = {};

  clearEvents() {
    _.map(
      this.cores,
      (v: SolrCore<object>, k) => v.clearEvents()
    );
  }

  registerCore<T extends object>(config: SolrConfig): SolrCore<T> {
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
  (data: T) => object | null | undefined;

export { 
  SolrQueryBuilder,
  SingleComponent,
  DataStore,
  SolrCore, 
  SolrGet, 
  SolrMoreLikeThis, 
  SolrQuery,
  PaginationData,
  SolrTransitions,
  SearchParams
};