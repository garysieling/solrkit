import * as React from 'react';
import * as _ from 'lodash';
import Lightbox from 'react-image-lightbox';

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
  PaginationData,
  SelectedFilters,
  HistogramFacet
} from 'solrkit';

import { AppDataStore } from './data/AppDataStore';

function title(facet: string) {
  return facet.substring(0, 1).toUpperCase() +
    facet
      .split('_')[0]
      .replace('AsString', '')
      .substring(1)
      .replace(
        /([A-Z])/g, ' $1'
      );
}

class SearchPageApp extends React.Component<{}, {loaded: boolean, lightboxOpen: boolean, photoIndex: number}> {
  private left: () => JSX.Element;
  private right: () => JSX.Element;
  private header: () => JSX.Element;
  private footer: () => JSX.Element;
  private rightRail: () => JSX.Element;
  private dataStore: AppDataStore;

  constructor() {
    super();

    this.state = {
      loaded: false,
      lightboxOpen: false,
      photoIndex: 0
    };
  }

  componentWillMount() {
    const self = this;
    const dataStore = new AppDataStore();
    this.dataStore = this.dataStore;

    dataStore.init(
      () => {    
        const core = dataStore.getCore();
        const facets = dataStore.getFacets().map(
          (facet, idx) => (
            <Bound
              key={idx}
              dataStore={core}
              event={core.registerFacet([facet])}
              render={
                (data: [string, number, boolean][]) => {
                  if (facet === 'yearAsString_s') {
                    return (
                      <HistogramFacet 
                        title={title(facet)}
                        values={data}
                        facet={facet}
                      />
                    );
                  }

                  return (
                    <CheckFacet 
                      title={title(facet)}
                      values={data}
                      search={true}
                      facet={facet}
                    />
                  );
                }
              }
            />
          )
        );

        this.left = () => (
          <div>
            {facets}

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
              <div>
                <div className="divided twelve wide columm">
                  <SelectedFilters title={title} />
                </div>
                <ResultsList 
                  docs={docs}
                  height={250} 
                  render={
                    (doc: object, index: number) => 
                      <div style={{height: '100%'}}>
                        {self.state.lightboxOpen &&
                          <Lightbox
                              mainSrc={_.get(docs[self.state.photoIndex], 'image_s')}
                              nextSrc={_.get(docs[(self.state.photoIndex + 1) % docs.length], 'image_s')}
                              prevSrc={_.get(docs[(self.state.photoIndex + docs.length - 1) % docs.length], 'image_s')}

                              onCloseRequest={() => self.setState({ lightboxOpen: false })}
                              onMovePrevRequest={() => this.setState({
                                  photoIndex: (self.state.photoIndex + docs.length - 1) % docs.length,
                              })}
                              onMoveNextRequest={() => this.setState({
                                  photoIndex: (self.state.photoIndex + 1) % docs.length,
                              })}
                          />
                        }
                        <img 
                          style={{height: '100%'}}
                          src={_.get(doc, 'image_s', '')} 
                          onClick={() => this.setState({ lightboxOpen: true, photoIndex: index })}
                        />
                      </div>
                  }
                />
              </div>
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
              <div className="ui horizontal divider" />
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