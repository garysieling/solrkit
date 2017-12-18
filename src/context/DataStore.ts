import * as Immutable from 'seamless-immutable';

import {
  SolrResponse
} from './Data';

import * as fetchJsonp from 'fetch-jsonp';
import * as _ from 'lodash';

import { FacetValue } from '../component/facet/FacetTypes';

function escape(value: QueryParam): string {
  if (value === '*') {
    return value;
  }
  
  return (
    (value.toString().indexOf(' ') > 0) ? (
      '"' + value.toString().replace(/ /g, '%20') + '"'
    ) : (
      value.toString()
    )
  );
}

// Note that the stored versions of these end up namespaced and/or aliased
enum UrlParams {
  ID = 'id',
  QUERY = 'query',
  FQ = 'fq',
  START = 'start',
  TYPE = 'type',
  HL = 'highlight'
}

interface SavedSearch {
  type?: 'QUERY' | 'MLT' | 'DETAILS';
  query?: string;
  boost?: string;
  facets?: { [ key: string ]: string[] };
}

interface SearchParams extends SavedSearch {
  start?: number;
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

  export() {
    return new SolrQueryBuilder<T>(
      () => new QueryBeingBuilt('wt=csv', null),
      this
    );
  }  

  qt(qt: string) {
    return new SolrQueryBuilder<T>(
      // TODO: tv.all here is probably wrong
      () => new QueryBeingBuilt('tv.all=true&qt=' + qt, null),
      this
    );
  }  

  q(searchFields: string[], value: QueryParam) {
    return new SolrQueryBuilder<T>(
      () => 
        new QueryBeingBuilt(
          'defType=edismax&q=' +
            searchFields.map(
              (field) => field + ':' + escape(value)
            ).join('%20OR%20'),
          [UrlParams.QUERY, value]
        )
      ,
      this
    );
  }

  bq(query: string) {
    return new SolrQueryBuilder<T>(
      () => {
        return new QueryBeingBuilt(
          'bq=' + query,
          null
        );
      },
      this
    );
  }

  fq(field: string, values: QueryParam[]) {
    return new SolrQueryBuilder<T>(
      () => {
        return new QueryBeingBuilt(
          'fq=' + 
            '{!tag=' + field + '_q}' +
            values.map(escape).map((v) => field + ':' + v).join('%20OR%20'),
          [UrlParams.FQ, [field, values]]
        );
      },
      this
    );
  }

  highlight(query: HighlightQuery) {
    if (query.fields.length > 0) {
      return new SolrQueryBuilder<T>(
        () => {
          let params: string[] = [
            'method',
            'fields',
            'query',
            'qparser',
            'requireFieldMatch',
            'usePhraseHighlighter',
            'highlightMultiTerm',
            'snippets',
            'fragsize',
            'encoder',
            'maxAnalyzedChars'].map(
              (key: string) => query[key] ? (
                'hl.' + key + '=' + query[key]
              ) : ''
            ).filter( 
              (key) => key !== ''
            );

          if (query.pre) {
            params.push('hl.tag.pre=' + query.pre);
          }

          if (query.post) {
            params.push('hl.tag.post=' + query.pre);
          }

          return new QueryBeingBuilt(
            'hl=true&' + 
            'hl.fl=' + query.fields.join(',') + (
              params.length > 0 ? ( '&' + params.join('&') ) : ''
            ),
            // Not saving these, because I'm assuming these will be
            // configured as part of the search engine, rather than
            // changed by user behavior
            null
          );
        }
      );
    } else {
      return null;
    }
  }

  fl(fields: QueryParam[]) {
    return new SolrQueryBuilder<T>(
      () => 
        new QueryBeingBuilt(
          'fl=' + fields.join(','),
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

  schema() {
    return new SolrQueryBuilder<T>(
      () => 
        new QueryBeingBuilt(
          'admin/luke?',
          null
        )
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
type FacetEvent = (object: FacetValue[]) => void;
type ErrorEvent = (error: object) => void;
type GetEvent<T> = (object: T) => void;
type MoreLikeThisEvent<T> = (object: T[]) => void;

interface SolrGet<T> {
  doGet: (id: string | number) => void;
  onGet: (cb: GetEvent<T>) => void;
}

interface SolrUpdate {
  doUpdate: (id: string | number, attr: string, value: string) => void;
}

interface SolrQuery<T> {
  doQuery: (q: GenericSolrQuery) => void;
  doExport: (q: GenericSolrQuery) => void;
  onQuery: (cb: QueryEvent<T>) => void;
  registerFacet: (facet: string[]) => (cb: FacetEvent) => void;
}

interface SolrHighlight<T> {
  onHighlight: (cb: QueryEvent<T>) => void;
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

type SolrSchemaFieldDefinition = {
  type: string;
  schema: string;
  dynamicBase: string;
  docs: number;
};

type SolrSchemaDefinition = {
  responseHeader: { status: number; QTime: number };
  index: {
    numDocs: number;
    maxDoc: number,
    deletedDocs: number,
    indexHeapUsageBytes: number;
    version: number;
    segmentCount: number;
    current: boolean;
    hasDeletions: boolean;
    directory: string;
    segmentsFile: string;
    segmentsFileSizeInBytes: number;
    userData: {
      commitTimeMSec: string;
      commitCommandVer: string;
    };

    lastModified: string;
  },
  fields: { [key: string]: SolrSchemaFieldDefinition};
  info: object;
};

interface SolrSchema {
  getSchema: () => SolrSchemaDefinition;
}

// TODO - this needs a lot more definition to be useful
interface GenericSolrQuery {
  query: string;
  boost?: string;
  rows?: number;
}

/**
 * See: https://lucene.apache.org/solr/guide/6_6/highlighting.html
 */
interface HighlightQuery {
  method?: 'unified' | 'original' | 'fastVector' | 'postings';
  fields: string[];
  query?: string; 
  qparser?: string;
  requireFieldMatch?: boolean;
  usePhraseHighlighter?: boolean;
  highlightMultiTerm?: boolean;
  snippets?: number;
  fragsize?: number;
  pre?: string;
  post?: string;
  encoder?: string;
  maxAnalyzedChars?: number;  
}

interface SolrConfig {
  url: string;
  core: string;
  primaryKey: string;
  defaultSearchFields: string[];
  fields: string[];
  pageSize: number;
  prefix: string;
  fq?: [string, string];
  qt?: string;
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
      );
      
    qb = qb.select().q(
      this.solrConfig.defaultSearchFields,
      query.query
    );
    
    if (this.solrConfig.qt) {
      qb = qb.qt(this.solrConfig.qt);
    }

    qb = qb.fl(this.solrConfig.fields).rows(
        query.rows || this.solrConfig.pageSize
      );

    if (this.solrConfig.fq) {
      qb = qb.fq(this.solrConfig.fq[0], [this.solrConfig.fq[1]]);
    }

    if (query.boost) {
      qb = qb.bq(query.boost);
    }

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
                          event(
                            _.zipWith(facetLabels, facetLabelCount, facetSelections).map(
                              (facetData: [string, number, boolean]) => {
                                return {
                                  value: facetData[0],
                                  count: facetData[1],
                                  checked: facetData[2]
                                };
                              }
                            ));
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

  doUpdate(id: string | number, attr: string, value: string) {
    const self = this;

    const op = {
      id: id,
    };

    op[attr] = { set: value };
    
    const url = this.solrConfig.url + this.solrConfig.core + '/' + 'update?commit=true';
    
    const http = new XMLHttpRequest();
    const params = JSON.stringify(op);

    http.open('POST', url, true);

    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    delete this.getCache[id];
    
    http.onreadystatechange = function() {
      if (http.readyState === 4) {
        // trigger UI re-render - don't care if success or failure
        // because we might have succeeded but got a CORS error
        self.doGet(id);
      }
    };
    
    http.send(params);
  }

  doExport()  {
    const query = this.getCurrentParameters();

    let qb = 
      new SolrQueryBuilder(
        () => new QueryBeingBuilt('', null),
      ).select().q(
        this.solrConfig.defaultSearchFields,
        query.query || '*'
      ).fl(this.solrConfig.fields)
       .rows(
        2147483647
      );

    if (this.solrConfig.fq) {
      qb = qb.fq(this.solrConfig.fq[0], [this.solrConfig.fq[1]]);
    }

    _.map(
      this.events.facet,
      (v, k) => {
        qb = qb.requestFacet(k);
      }
    );
      
    qb = qb.export();

    const url = this.solrConfig.url + this.solrConfig.core + '/' + qb.buildSolrUrl();
    window.open(url, '_blank');
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
          query: newState.query || '*',
          boost: newState.boost
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
    
    if (!_.endsWith(key, '/')) {
      key += '/';
    }

    key += config.core;

    if (!this.cores[key]) {
      this.cores[key] = new SolrCore<T>(config);
    }

    return (this.cores[key] as SolrCore<T>);
  }  
}

class AutoConfiguredDataStore extends DataStore {
  private core: SolrCore<object> & SolrGet<object> & SolrQuery<object>;
  private facets: string[];
  private fields: string[];

  getCore() {
    return this.core;
  }

  getFacets() {
    return this.facets;
  }

  getFields() {
    return this.fields;
  }

  autoconfigure<T extends object>(
    config: SolrConfig, 
    complete: () => void,
    useFacet: (facet: string) => boolean
  ): void {
    const callback = 'cb_autoconfigure_' + config.core;
    useFacet = useFacet || ((facet: string) => true);
    
    let qb = 
      new SolrQueryBuilder(
        () => new QueryBeingBuilt('', null),
      ).schema().jsonp(
        callback
      );

    const url = config.url + config.core + '/' + qb.buildSolrUrl();

    fetchJsonp(url, {
      jsonpCallbackFunction: callback
    }).then(
      (data) => {
        data.json().then( 
          (responseData: SolrSchemaDefinition) => {
            // TODO cache aggressively
            const fields = 
              _.toPairs(responseData.fields).filter(
                ([fieldName, fieldDef]) => {
                  return fieldDef.docs > 0 && fieldDef.schema.match(/I.S............../);
                }
              ).map(
                ([fieldName, fieldDef]) => fieldName
              );

            const defaultSearchFields = 
              _.toPairs(responseData.fields).filter(
                ([fieldName, fieldDef]) => {
                  return fieldDef.docs > 0 && fieldDef.schema.match(/I................/);
                }
              ).map(
                ([fieldName, fieldDef]) => fieldName
              );

            const coreConfig = _.extend(
              {}, 
              {
                primaryKey: 'id',
                fields: fields,
                defaultSearchFields: defaultSearchFields,
                pageSize: 50,
                prefix: config.core
              },
              config
            );

            this.core = new SolrCore<T>(coreConfig);
            this.fields = fields;
            this.facets = fields.filter(useFacet);

            this.core.registerFacet(this.facets)(_.identity);
            complete();
          }
        );
      }
    );
  } 
}

type SingleComponent<T> =
  (data: T, index?: number) => object | null | undefined;

export { 
  ErrorEvent,
  UrlParams,
  QueryParam,
  HighlightQuery, 
  NamespacedUrlParam,
  UrlFragment,
  PaginationData,
  SavedSearch,
  SearchParams,  
  QueryBeingBuilt,
  SolrQueryBuilder,
  SingleComponent,
  MoreLikeThisEvent,  
  GetEvent,
  GenericSolrQuery,
  QueryEvent,
  FacetEvent,
  SolrConfig,  
  SolrGet, 
  SolrUpdate,
  SolrMoreLikeThis, 
  SolrQuery,
  SolrHighlight,
  SolrTransitions,  
  SolrCore,  
  SolrSchemaFieldDefinition,
  SolrSchemaDefinition,
  SolrSchema,
  DataStore,
  AutoConfiguredDataStore
};