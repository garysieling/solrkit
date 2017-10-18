import * as React from 'react';
import { ResultsLayout } from '../../../layout/ResultsLayout';
import { ResultsList } from '../../../component/ResultsList';
import { SearchBox } from '../../../component/SearchBox';
import { Pagination } from '../../../component/Pagination';
import { databind } from '../../../context/DataBinding';
import { suggestions } from './talks/suggestions';
import { PaginationData } from '../../../context/DataStore';
import { CheckFacet } from '../../../component/CheckFacet';
import { TalkSearchDataStore } from './talks/TalkSearchDataStore';
import { Talk } from './talks/Talk';

interface DetailAppProps {
  id: string;
  load: (id: string) => void;
}

const dataStore: TalkSearchDataStore = new TalkSearchDataStore();

class SearchPageApp extends React.Component<DetailAppProps, {}> {
  private left: () => JSX.Element;
  private right: () => JSX.Element;
  private header: () => JSX.Element;
  private footer: () => JSX.Element;

  constructor() {
    super();

    this.left = () => (
      <div>
        <CheckFacet values={['Audio', 'Video']} />
      </div>
    );

    this.right = databind(
      dataStore.talks.onQuery,
      dataStore.talks,
      (talks: Talk[], pagination: PaginationData) => {
        return (
          <ResultsList 
            docs={talks} 
            render={
              (talk: Talk) => 
                <a href={'/view/' + talk.id}>
                  {talk.title_s}
                </a>
            }
          />
        );
      }
    );

    this.header = databind(
      dataStore.talks.onQuery,
      dataStore.talks,
      (talks: Talk[], pagination: PaginationData) => (
        <SearchBox 
          initialQuery="" 
          placeholder="Search..."
          onDoSearch={(query: string) => {
            dataStore.talks.doQuery({
              rows: 10,
              query
            });
          }}
          loading={false}
          sampleSearches={suggestions}
        />
      )
    );
    
    this.footer = databind(
      dataStore.talks.onQuery,
      dataStore.talks,
      (talks: Talk[], pagination: PaginationData) => (
        <Pagination
          numRows={pagination.numFound}
          start={pagination.start}
          pageSize={pagination.pageSize}
        />)
    );
  }

  init() {
    dataStore.talks.doQuery({
      rows: 10,
      query: '*'
    });
  }

  componentWillReceiveProps() {
    this.init();
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    dataStore.clearEvents();
  }

  render() { 
    return (
      <ResultsLayout 
        leftComponent={this.left}
        rightComponent={this.right}
        headerComponent={this.header}
        footerComponent={this.footer}
      />
    );
  }
}

export { SearchPageApp };