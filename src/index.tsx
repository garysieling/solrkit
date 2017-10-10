import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

import { NotFound } from './pages/NotFound';
import { DetailPage } from './pages/Detail';
import { Search } from './pages/Search';

import { Route } from 'react-router';
import { BrowserRouter, Switch } from 'react-router-dom';

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

const DetailPageApp = (props: RouterProps) => {
  return (
    <DetailPage 
      url="http://40.87.64.225:8983/solr/"
      core="talks"
      initial={{}}
      id={props.match.params.id}
    />
  );
};

const Routes = (props) => (
  <BrowserRouter {...props}>
    <Switch>
      <Route exact={true} path="/" component={Search} />
      <Route path="/view/:id" component={DetailPageApp} />
      <Route path="*" component={NotFound} />
    </Switch>
  </BrowserRouter>
);

ReactDOM.render(
  <Routes />,
  document.getElementById('root') as HTMLElement
);

registerServiceWorker();
