import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DetailPageApp } from './example/video/pages/DetailPage';
import { SearchPageApp } from './example/video/pages/SearchPage';

it('DetailPageApp renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <DetailPageApp 
      id="example" 
      load={(id: string) => { 
        //
      }} 
    />, 
    div);
});

it('SearchPageApp renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <SearchPageApp />, 
    div);
});
