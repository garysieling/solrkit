import * as React from 'react';
import { ResultsLayout } from '../../../layout/ResultsLayout';
import { ResultsList } from '../../../component/ResultsList';
import { SearchBox } from '../../../component/SearchBox';
import { Pagination } from '../../../component/Pagination';
import { databind } from '../../../context/DataBinding';
import { suggestions } from './talks/suggestions';
import { PaginationData } from '../../../context/DataStore';
import { CheckFacet } from '../../../component/facet/CheckFacet';
import { RadioFacet } from '../../../component/facet/RadioFacet';
import { TalkSearchDataStore } from './talks/TalkSearchDataStore';
import { ToggleFacet } from '../../../component/facet/ToggleFacet';
import { DropdownFacet } from '../../../component/facet/DropdownFacet';
import { TagFacet } from '../../../component/facet/TagFacet';
import { SingleNumber } from '../../../component/statistics/SingleNumber';
import { Link } from 'react-router-dom';
import { Talk } from './talks/Talk';

interface SearchPageProps {
}

const dataStore: TalkSearchDataStore = new TalkSearchDataStore();

class SearchPageApp extends React.Component<SearchPageProps, {}> {
  private left: () => JSX.Element;
  private right: () => JSX.Element;
  private header: () => JSX.Element;
  private footer: () => JSX.Element;
  private rightRail: () => JSX.Element;

  constructor() {
    super();

    this.left = () => (
      <div>
        <CheckFacet title="Test 1" values={['Audio', 'Video']} />
        <RadioFacet title="Test 2" values={['Audio', 'Video']} />
        <ToggleFacet title="Test 2" values={['Audio', 'Video']} />
        <DropdownFacet title="Test 2" name="test" values={['Audio', 'Video']} />
        <TagFacet title="Test 2" name="test" values={['Audio', 'Video']} />        
      </div>
    );

    const databindTalksQuery = 
      (fn: ((talks: Talk[], pagination: PaginationData) => JSX.Element)) => 
        databind(
          dataStore.talks.onQuery,
          dataStore.talks,
          fn);

    this.right = databindTalksQuery(
      (talks: Talk[], pagination: PaginationData) => {
        return (
          <ResultsList 
            docs={talks} 
            render={
              (talk: Talk) => 
                <Link to={'/view/' + talk.id}>
                  {talk.title_s}
                </Link>
            }
          />
        );
      }
    );

    this.header = databindTalksQuery(
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
    
    this.footer = databindTalksQuery(
      (talks: Talk[], pagination: PaginationData) => (
        <Pagination
          numRows={pagination.numFound}
          start={pagination.start}
          pageSize={pagination.pageSize}
        />)
    );

    this.rightRail = databindTalksQuery(
      (talks: Talk[], pagination: PaginationData) => (
        <SingleNumber value={pagination.numFound} label="Talks" />
      )
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
        rightRailComponent={this.rightRail}
      />
    );
  }
}

export { SearchPageApp };