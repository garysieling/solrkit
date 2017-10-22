import * as React from 'react';
import { ResultsLayout } from '../../../layout/ResultsLayout';
import { ResultsList } from '../../../component/ResultsList';
import { SearchBox } from '../../../component/SearchBox';
import { Pagination } from '../../../component/Pagination';
import { databind } from '../../../context/DataBinding';
import { PaginationData } from '../../../context/DataStore';
import { CheckFacet } from '../../../component/facet/CheckFacet';
import { AppDataStore } from './data/AppDataStore';
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

    this.left = () => (
        <div>{
        databind(
          dataStore.windows.registerFacet(['place']),
          dataStore.windows,
          (data: [string, number, boolean][]) => (
            <div>            
              <CheckFacet 
                title="place" 
                values={data}
                facet="place"
                render={(label: string, value: number) => label + ': ' + value.toLocaleString()}
              />

              <CheckFacet 
                title="Faces" 
                values={data}
                facet="face_count"
                render={(label: string, value: number) => label + ': ' + value.toLocaleString()}
              />
  
              <CheckFacet 
                title="height" 
                values={data}
                facet="height"
                render={(label: string, value: number) => label + ': ' + value.toLocaleString()}
              />

              <CheckFacet 
                title="width" 
                values={data}
                facet="width"
                render={(label: string, value: number) => label + ': ' + value.toLocaleString()}
              />

              <CheckFacet 
                title="aspect" 
                values={data}
                facet="aspect"
                render={(label: string, value: number) => label + ': ' + value.toLocaleString()}
              />
            </div>
          )
        )
      }</div>
    );

    const databindWindowsQuery = 
      (fn: ((Windows: Document[], pagination: PaginationData) => JSX.Element)) => 
        databind(
          dataStore.windows.onQuery,
          dataStore.windows,
          fn);

    this.right = databindWindowsQuery(
      (Windows: Document[], pagination: PaginationData) => {
        return (
          <ResultsList 
            docs={Windows} 
            render={
              (window: Document) => 
                <Link to={'/view/' + window.id}>
                  {window.file}
                </Link>
            }
          />
        );
      }
    );

    this.header = databindWindowsQuery(
      (Windows: Document[], pagination: PaginationData) => (
        <div className="ui grid">
          <div className="three wide column">
            <SingleNumber horizontal={true} value={pagination.numFound} label="Windows" />
          </div>
          <div className="thirteen wide column">
            <SearchBox 
              placeholder="Search..."
              loading={false}
            />
          </div>
        </div>
      )
    );
    
    this.footer = databindWindowsQuery(
      (Windows: Document[], pagination: PaginationData) => (
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