import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

import { NotFound } from './pages/NotFound';
import { SearchPageApp } from './pages/SearchPage';

import { Route } from 'react-router';
import { BrowserRouter, Switch } from 'react-router-dom';

import { DetailPageApp } from './pages/DetailPage';

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
            render={
              () => <SearchPageApp />
            }
          />
          <Route 
            path="/view/:id" 
            render={({match}) => <DetailPageApp id={match.params.id} />}
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
