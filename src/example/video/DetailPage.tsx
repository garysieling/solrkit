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
        url: 'http://40.87.64.225:8983/solr/',
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

interface DataBoundProps<T> {
  dataStore: SolrGet<T> & SolrMoreLikeThis<T>;
  render: (props: T) => JSX.Element;
}

interface DataBoundState<T> {
  object?: T;
  moreLikeThis?: T[];
}

class DataBound<T> extends React.Component<DataBoundProps<T>, DataBoundState<T>> {
  constructor(props: DataBoundProps<T>) {
    super(props);

    this.state = {
      object: undefined,
      moreLikeThis: undefined
    };

    // This needs to happen early
    props.dataStore.onGet(
      (data: T) => {
        this.setState( {
          object: data
        });
      }
    );

    props.dataStore.onMoreLikeThis(
      (data: T[]) => {
        this.setState( {
          moreLikeThis: data
        });
      }
    );
  }

  render() {
    // TODO these need to be named or something
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

  private left: () => JSX.Element;
  private right: () => JSX.Element;
  private header: () => JSX.Element;

  constructor() {
    super();

    this.left = databind(
      this.dataStore.talks,
      (talk: Talk) => (<VideoPlayer {...talk} />)
    );

    this.right = databind(
      this.dataStore.talks,
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

    this.header = databind(
      this.dataStore.talks,
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
  }

  componentDidMount() {
    this.dataStore.talks.doGet(this.props.id);
    this.dataStore.talks.doMoreLikeThis(this.props.id);
  }
  
  render() { 
    return (
      <DetailLayout 
        leftComponent={this.left}
        rightComponent={this.right}
        headerComponent={this.header}
      />
    );
  }
}

export { DetailPageApp };