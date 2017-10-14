import * as React from 'react';
import { DetailLayout } from '../../layout/DetailLayout';
import { MoreLikeThis } from '../../components/MoreLikeThis';
import { SearchBox } from '../../components/SearchBox';
import { DataStore, SolrCore, SolrGet, SolrMoreLikeThis, SolrQuery } from '../../context/DataStore';

interface Talk {
  id: string;
  title_s: string;
  url_s: string;
}

class VideoPlayer extends React.Component<Talk, {}> {
  youtubeId(url: String) {
    return url.replace(/.*v=/, '');
  }

  render() {
    const url = this.props.url_s;
    console.log(this.props);

    if (this.props.url_s === '') {
      return null;
    }

    return (
      <div>
        <iframe 
          id="player" 
          width="100%"
          height="390"
          src={'http://www.youtube.com/embed/' + this.youtubeId(url)} 
        />
        <h2>
          {this.props.title_s}
        </h2>
      </div>
    );
  }
}

interface Talk {
  title_s: string;
  id: string;
  url: string;
}

// Ideally you want to write code like this:
// 
//  DataStore.books.get = (talk: Talk) => <Detail {...talk} />
//  bind(onClick, (e) => DataStore.books.get(e.target.value))
//
//  Which would suggest that...
//    We need a different type T for each core
//    get needs to be a property?
type TalkCoreCapabilities = SolrCore<Talk> & SolrGet<Talk> & SolrMoreLikeThis<Talk> & SolrQuery<Talk>;
class TalkSearchDataStore extends DataStore {
  private talksCore: TalkCoreCapabilities;

  constructor() {
    super();
  }

  // Every core should have it's own function
  // registered in your datastore
  //
  // If you want to have some UI controls use
  // different subsets of the data in the index
  // you should register one entry per use case.
  get talks(): TalkCoreCapabilities {
    if (!this.talksCore) {
      this.talksCore = super.registerCore({
        url: '',
        core: 'talks',
        primaryKey: 'id',
        // Unfortunately these have to be repeated 
        // since there is no apparent way to sync
        // this with Typescript
        fields: ['title_s', 'url_s', 'id'],
      });
    }

    return this.talksCore;
  }
}

// const tds = new TalkSearchDataStore();
// Good spot for HOC here
/*tds.talks.onGet(
  () => this.setState()
)*/

/*

    // TODO - the invidivual components should register what they need:
    //   Solr, core, fields

    // mlt component
    const right = 
        (talk) => (
          <div>
            {talk.title_s}
          </div>
        );

    // todo - maybe loading should just go in everything
    const header = () => ( 
      
    );

    //rightComponent={right}
    //headerComponent={header}

    */

class DataBound<T> extends React.Component<{
  dataStore: SolrGet<T>,
  render: (props: T) => JSX.Element
}, {object?: T}> {
  constructor() {
    super();

    this.state = {
      object: undefined
    };
  }

  componentDidMount() {
    // TODO this is broken - move into HOC that binds
    //      individual controls to data
    this.props.dataStore.onGet(
      (data: T) => {
        this.setState( {
          object: data
        });
      }
    );
  }
  
  render() {
    if (!this.state.object) {
      return null;
    }

    return (
      this.props.render(this.state.object)
    );
  }
}

function databind<T>(
    ds: SolrCore<T>,
    render: 
      (v: T | T[]) => JSX.Element
) {
  return () => (
    <DataBound
      dataStore={ds}
      render={render}
    />
  );
}

class DetailPageApp extends React.Component<{id: string}, {}> {
  private dataStore: TalkSearchDataStore = new TalkSearchDataStore();

  constructor() {
    super();
  }
  
  render() {
    const self = this;

    const left = databind(
      self.dataStore.talks,
      (talk: Talk) => (<VideoPlayer {...talk} />)
    );

    const right = databind(
      self.dataStore.talks,
      (talks: Talk[]) => (
        <MoreLikeThis 
          docs={talks} 
          render={
            (talk: Talk) => (
              <div>
                {talk.title_s}
              </div>
            )
          }
        />)
    );

    const header = databind(
      self.dataStore.talks,
      (talk: Talk) => (
        <SearchBox 
          initialQuery="" 
          placeholder="Search..."
          onDoSearch={(query: String) => {
            // do something
          }}
          loading={false}
          sampleSearches={[]}
        />
      )
    );


    // basic problem:
    

    return (
      <DetailLayout 
        leftComponent={left}
        rightComponent={right}
        headerComponent={header}
      />
    );
  }
}

export { DetailPageApp };