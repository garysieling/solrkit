import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

import { NotFound } from './pages/NotFound';
import { Search } from './pages/Search';

import { Route } from 'react-router';
import { BrowserRouter, Switch } from 'react-router-dom';

import { DetailPageApp } from './example/video/DetailPage';

interface RouterProps {
  history: object;
  location: object;
  match: {
    isExact: boolean;
    params: {
      id: string;
    };
    path: string;
    url: string;
  };
}

const Routes = (props) => (
  <BrowserRouter {...props}>
    <Switch>
      <Route exact={true} path="/" component={Search} />
      <Route 
        path="/view/:id" 
        component={
          (detailProps: RouterProps) => 
            <DetailPageApp 
              {...detailProps.match.params} 
            />
        } 
      />
      <Route path="*" component={NotFound} />
    </Switch>
  </BrowserRouter>
);

ReactDOM.render(
  <Routes />,
  document.getElementById('root') as HTMLElement
);

registerServiceWorker();
