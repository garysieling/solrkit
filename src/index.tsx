import * as ReactDOM from 'react-dom';
import * as React from 'react';

import { Routes as VideoRoutes } from './example/video/index';
import { Routes as GlassRoutes } from './example/glass/index';

import registerServiceWorker from './registerServiceWorker';
import { Switch, BrowserRouter } from 'react-router-dom';

registerServiceWorker();

export function main() {
  ReactDOM.render(
    (
      <BrowserRouter>
        <Switch>
          {VideoRoutes}
          {GlassRoutes}
        </Switch>
      </BrowserRouter>
    ),
    document.getElementById('root') as HTMLElement
  );
}

main();