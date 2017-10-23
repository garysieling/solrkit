import * as React from 'react';
import { ResultsLayout } from '../../../layout/ResultsLayout';
import { ResultsList } from '../../../component/ResultsList';
import { SearchBox } from '../../../component/SearchBox';
import { Pagination } from '../../../component/Pagination';
import { Bound, databind } from '../../../context/DataBinding';
import { PaginationData } from '../../../context/DataStore';
import { CheckFacet } from '../../../component/facet/CheckFacet';
import { AppDataStore } from './data/AppDataStore';
import { SingleNumber } from '../../../component/statistics/SingleNumber';
import { Document } from './data/Document';
import { Link } from 'react-router-dom';

const dataStore = new AppDataStore();

class SearchPageApp extends React.Component<{}, {}> {
  static dataStore = dataStore;

  private left: () => JSX.Element;
  private right: () => JSX.Element;
  private header: () => JSX.Element;
  private footer: () => JSX.Element;
  private rightRail: () => JSX.Element;

  constructor() {
    super();

    this.left = () => (
      <div>
        <Bound
          dataStore={dataStore.windows}
          event={dataStore.windows.registerFacet(['place'])}
          render={
            (data: [string, number, boolean][]) => (
              <CheckFacet 
                title="Place" 
                values={data}
                search={true}
                facet="place"
                render={(label: string, value: number) => 
                  label + ': ' + value.toLocaleString()}
              />
            )
          }
        />

        <Bound
          dataStore={dataStore.windows}
          event={dataStore.windows.registerFacet(['resnet50_tags'])}
          render={
            (data: [string, number, boolean][]) => (
              <CheckFacet 
                title="Tags" 
                values={data}
                facet="resnet50_tags"
                render={(label: string, value: number) => 
                  label + ': ' + value.toLocaleString()}
              />
            )
          }
        />
        
        <Bound
          dataStore={dataStore.windows}
          event={dataStore.windows.registerFacet(['face_count'])}
          render={
            (data: [string, number, boolean][]) => (
              <CheckFacet 
                title="Faces" 
                values={data}
                facet="face_count"
                render={(label: string, value: number) => 
                  label + ': ' + value.toLocaleString()}
              />
            )
          }
        />
      </div>
    );

    const databindWindowsQuery = 
      (fn: ((Windows: Document[], pagination: PaginationData) => JSX.Element)) => 
        databind(
          dataStore.windows.onQuery,
          dataStore.windows,
          fn);

    this.right = databindWindowsQuery(
      (windows: Document[], pagination: PaginationData) => {
        return (
          <ResultsList 
            docs={windows} 
            widthColumn={'width'}
            heightColumn={'height'}
            perRow={7}
            evenHeight={true}
            render={
              (window: Document) => 
                <Link 
                  to={'/window/' + window.id}
                  style={{height: '100%'}}
                >
                  <img 
                    style={{height: '100%'}}
                    src={window.url} 
                  />
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
/*
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
            </div>*/