import * as React from 'react';
import { SearchPageApp } from './pages/SearchPage';

import { Route } from 'react-router';

import { DetailPageApp } from './pages/DetailPage';
import { SearchParams, SolrCore, DataStore } from '../../context/DataStore';
import * as _ from 'lodash';

interface RequiredAppProps {
  dataStore: DataStore;
}

interface PageParams {
  page: string;
  query: string;
}

interface SearchAppProps {
  app: RequiredAppProps;
  params: PageParams;
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
    start: (parseInt(params.page || '1', 10) - 1) * 10
  };
}

class SearchApp extends React.Component<SearchAppProps, {}> {
  constructor() {
    super();
  }

  init() {
    // TODO I think this is the point where namespacing would start
    _.map(
      this.props.app.dataStore.cores,
      (core, i) => namespace(fixParams(this.props.params), core, core.getNamespace())
    ).map(
      (thisCore: [SolrCore<object>, SearchParams]) => 
        thisCore[0].stateTransition(thisCore[1])
      );
  }

  componentDidMount() {
    this.init();
  }
  
  componentWillUnmount() {
    this.props.app.dataStore.clearEvents();
  }

  render() {
    return <SearchPageApp />;
  }
}

const defaultParams = {
  page: '1',
  query: '*'
};

const Routes = [(
    <Route 
      exact={true} 
      path="/glass" 
      render={() => <SearchApp params={defaultParams} app={SearchPageApp} />}
    />
  ), (
    <Route 
      exact={true} 
      path="/glass/:query/:page" 
      render={({match}) => <SearchApp params={match.params} app={SearchPageApp} />}
    />
  ), (
    <Route 
      path="/window/:id" 
      component={({match}) => <DetailPageApp id={match.params.id} />}
    />
  )
];

export { Routes };