import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DetailPageApp } from './example/video/DetailPage';

it('DetailPageApp renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<DetailPageApp id="example" />, div);
});
