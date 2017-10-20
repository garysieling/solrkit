import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

import { NotFound } from './pages/NotFound';
import { SearchPageApp } from './pages/SearchPage';

import { Route } from 'react-router';
import { BrowserRouter, Switch } from 'react-router-dom';

import { DetailPageApp } from './pages/DetailPage';
import { DataStore, SolrQueryBuilder } from '../../context/DataStore';
import * as _ from 'lodash';

interface RequiredAppProps {
  dataStore: DataStore;
}

interface SearchParams {
  query?: string;
  page: string;
}

interface SearchAppProps {
  app: RequiredAppProps;
  params: SearchParams;
}

class SearchApp extends React.Component<SearchAppProps, {}> {
  init() {
    _.map(
      this.props.app.dataStore.cores,
      (core) => core.doQuery(
        {
          rows: 10,
          query: this.props.params.query || '*'
        }, 
        (qb: SolrQueryBuilder<{}>) => {
          return qb.start(
            (parseInt(this.props.params.page, 10) - 1) * 10
          );
        }
      )
    );
  }

  componentWillReceiveProps() {
    this.init();
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
  query: undefined
};

class Routes extends React.Component<{}, {}> {
  constructor() {
    super();
  }

  render() {    
    return (
      <BrowserRouter>
        <Switch>
          <Route 
            exact={true} 
            path="/" 
            render={() => <SearchApp params={defaultParams} app={SearchPageApp} />}
          />
          <Route 
            exact={true} 
            path="/search/:query/:page" 
            render={({match}) => <SearchApp params={match.params} app={SearchPageApp} />}
          />
          <Route 
            path="/view/:id" 
            component={({match}) => <DetailPageApp id={match.params.id} />}
          />
          <Route path="*" component={NotFound} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export function main() {
  ReactDOM.render(
    <Routes />,
    document.getElementById('root') as HTMLElement
  );
}
