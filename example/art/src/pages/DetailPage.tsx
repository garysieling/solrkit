import * as React from 'react';

import { 
  databind,
  SearchBox,
  DetailLayout
} from 'solrkit';

import { AppDataStore } from './data/AppDataStore';

class DocumentDetails extends React.Component<Document, {}> {
  constructor() {
    super();
  }

  render() {    
    return (
      <div>
        test
      </div>
    );
  }
}

interface DetailAppProps {
  id: string;
}

const dataStore = new AppDataStore();

class DetailPageApp extends React.Component<DetailAppProps, {}> {
  private left: () => JSX.Element;
  private right: () => JSX.Element;
  private header: () => JSX.Element;

  constructor() {
    super();

    this.left = databind(
      dataStore.getCore().onGet,
      dataStore.getCore(),
      (talk: Document) => (
        <DocumentDetails {...talk} />
      )
    );
    
    this.header = databind(
      dataStore.getCore().onGet,
      dataStore.getCore(),
      (talk: Document) => (
        <SearchBox 
          placeholder="Search..."
          loading={false}
        />
      )
    );
  }

  init() {
    // dataStore.windows.doGet(this.props.id.replace(/_/g, '/'));
  }

  componentWillReceiveProps() {
    this.init();
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    // dataStore.clearEvents();
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