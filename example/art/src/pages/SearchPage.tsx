import * as React from 'react';
import * as _ from 'lodash';

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
import { Link } from 'react-router-dom';

class SearchPageApp extends React.Component<{}, {loaded: boolean}> {
  private left: () => JSX.Element;
  private right: () => JSX.Element;
  private header: () => JSX.Element;
  private footer: () => JSX.Element;
  private rightRail: () => JSX.Element;

  constructor() {
    super();

    this.state = {
      loaded: false
    };
  }

  componentWillMount() {
    const dataStore = new AppDataStore();

    dataStore.init(
      () => {    
        this.left = () => (
          <div>
            <Bound
              dataStore={dataStore.getCore()}
              event={dataStore.getCore().registerFacet(['place'])}
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

            <div>
              <h4>Options</h4>
              
              <ExcelExport core={dataStore.getCore()} />Export to Excel
            </div>

          </div>
        );

        const databindQuery = 
          (fn: ((docs: Document[], pagination: PaginationData) => JSX.Element)) => 
            databind(
              dataStore.getCore().onQuery,
              dataStore.getCore(),
              fn);

        this.right = databindQuery(
          (docs: Document[], pagination: PaginationData) => {
            return (
              <ResultsList 
                docs={docs}
                height={250} 
                render={
                  (doc: object) => 
                    <Link
                      to={'/piece/' + _.get(doc, 'id')}
                      style={{height: '100%'}}
                    >
                      <img 
                        style={{height: '100%'}}
                        src={_.get(doc, 'image_s', '')} 
                      />
                    </Link>
                }
              />
            );
          }
        );

        this.header = databindQuery(
          (docs: Document[], pagination: PaginationData) => (
            <div className="ui grid">
              <div className="three wide column">
                <SingleNumber horizontal={true} value={pagination.numFound} label="Artworks" />
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
        
        this.footer = databindQuery(
          (documents: Document[], pagination: PaginationData) => (
            <Pagination
              numRows={pagination.numFound}
              pageSize={pagination.pageSize}
            />)
        );
               
        dataStore.getCore().doQuery({query: '*'});

        this.setState({
          loaded: true
        });
      });
  }

  render() { 
    if (!this.state.loaded) {
      return null;
    }

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