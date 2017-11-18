import * as React from 'react';
import { ResultsLayout } from '../../../layout/ResultsLayout';
import { ResultsList } from '../../../component/ResultsList';
import { SearchBox } from '../../../component/SearchBox';
import { Pagination } from '../../../component/Pagination';
import { databind } from '../../../context/DataBinding';
import { suggestions } from './data/suggestions';
import { PaginationData } from '../../../context/DataStore';
import { CheckFacet } from '../../../component/facet/CheckFacet';
import { RadioFacet } from '../../../component/facet/RadioFacet';
import { AppDataStore } from './data/AppDataStore';
import { ToggleFacet } from '../../../component/facet/ToggleFacet';
import { DropdownFacet } from '../../../component/facet/DropdownFacet';
import { TagFacet } from '../../../component/facet/TagFacet';
import { SingleNumber } from '../../../component/statistics/SingleNumber';
import { Link } from 'react-router-dom';
import { Document } from './data/Document';

interface SearchPageProps {
}

const dataStore = new AppDataStore();

class SearchPageApp extends React.Component<SearchPageProps, {}> {
  static dataStore = dataStore;

  private left: () => JSX.Element;
  private right: () => JSX.Element;
  private header: () => JSX.Element;
  private footer: () => JSX.Element;
  private rightRail: () => JSX.Element;

  constructor() {
    super();

    this.left = 
      databind(
        dataStore.talks.registerFacet(['features_ss']),
        dataStore.talks,
        (data: [string, number, boolean][]) => (
          <div>
            <CheckFacet 
              title="Features" 
              values={data}
              facet="features_ss"
              render={(label: string, value: number) => label + ': ' + value.toLocaleString()}
            />

            <DropdownFacet 
              title="Features" 
              facet="features_ss"
              values={data}
            />

            <RadioFacet 
              title="Features" 
              facet="features_ss"
              values={data}
            />

            <ToggleFacet
              title="Features" 
              facet="features_ss"
              values={data}
            />

            <TagFacet 
              title="Features" 
              facet="features_ss"
              values={data}
            />
          </div>
        )
      );

    const databindTalksQuery = 
      (fn: ((talks: Document[], pagination: PaginationData) => JSX.Element)) => 
        databind(
          dataStore.talks.onQuery,
          dataStore.talks,
          fn);

    this.right = databindTalksQuery(
      (talks: Document[], pagination: PaginationData) => {
        return (
          <ResultsList 
            docs={talks} 
            render={
              (talk: Document) => 
                <Link to={'/view/' + talk.id}>
                  {talk.title_s}
                </Link>
            }
          />
        );
      }
    );

    this.header = databindTalksQuery(
      (talks: Document[], pagination: PaginationData) => (
        <div className="ui grid">
          <div className="three wide column">
            <SingleNumber horizontal={true} value={pagination.numFound} label="Talks" />
          </div>
          <div className="thirteen wide column">
            <SearchBox 
              placeholder="Search..."
              loading={false}
              sampleSearches={suggestions}
            />
          </div>
        </div>
      )
    );
    
    this.footer = databindTalksQuery(
      (talks: Document[], pagination: PaginationData) => (
        <Pagination
          numRows={pagination.numFound}
          pageSize={pagination.pageSize}
        />)
    );
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