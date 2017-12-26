import { SearchParams, SolrCore, DataStore } from './DataStore';
import * as _ from 'lodash';

import './App.css';

interface PageParams {
  page: string;
  query: string;
}

function namespace(params: SearchParams, core: SolrCore<{}>, ns: string): [SolrCore<{}>, SearchParams] {
  const result: [SolrCore<{}>, SearchParams] = [core, {
    // TODO NAMESPACING
    type: 'QUERY',
    query: params.query,
    start: params.start
  }];

  return result;
}

function fixParams(params: PageParams): SearchParams {
  return {
    type: 'QUERY',
    query: params.query,
    start: (parseInt(params.page || '1', 50) - 1) * 50
  };
}

function initializePage(dataStore: DataStore, params: PageParams) {
  return _.map(
    dataStore.cores,
    (core, i) => namespace(fixParams(params), core, 'glass')
  ).map(
    (thisCore: [SolrCore<object>, SearchParams]) => 
      thisCore[0].stateTransition(thisCore[1])
  );
}

interface PageParams {
  page: string;
  query: string;
}

export {
  initializePage,
  PageParams
};
