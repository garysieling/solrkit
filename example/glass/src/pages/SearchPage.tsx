import * as React from 'react';

import { 
  SingleNumber,
  Bound, 
  databind,
  ExcelExport,
  Pagination,
  ResultsList,
  SearchBox,
  CheckFacet,
  ResultsLayout,
  PaginationData
} from 'solrkit';

import { AppDataStore } from './data/AppDataStore';
import { Document } from './data/Document';
import { Link } from 'react-router-dom';
import { Popup } from 'semantic-ui-react';

const dataStore = new AppDataStore();

function popup(
  condition: boolean,
  component: JSX.Element,
  tooltip: string
) {
  if (condition) {
    return (
      <Popup
        trigger={component}
        content={tooltip}
      />
    );
  } else {
    return component;
  }
}

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
          event={dataStore.windows.registerFacet(['gv_labels'])}
          render={
            (data: [string, number, boolean][]) => (
              <CheckFacet 
                title="Labels" 
                help="Google Vision API"
                values={data}
                facet="gv_labels"
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
                help="ResNet 50"
                values={data}
                search={true}
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

        <div>
          <h4>Options</h4>
          
          <ExcelExport core={dataStore.windows} />Export to Excel
        </div>

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
            height={250}
            render={
              (window: Document) => 
                popup(
                  !!window.gv_inscription 
                    && (window.gv_inscription.length > 0)
                    && (window.gv_inscription[0] !== ''),
                  <Link 
                    to={'/window/' + window.id.replace(/\//g, '_')}
                    style={{height: '100%'}}
                  >
                    <img 
                      style={{height: '100%'}}
                      src={window.url} 
                    />
                  </Link>,
                  window.gv_inscription[0]
                )
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
          <div className="twelve wide column">
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