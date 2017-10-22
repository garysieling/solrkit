import * as React from 'react';
import { DetailLayout } from '../../../layout/DetailLayout';
import { MoreLikeThis } from '../../../component/MoreLikeThis';
import { SearchBox } from '../../../component/SearchBox';
import { AppDataStore } from './data/AppDataStore';
import { databind } from '../../../context/DataBinding';
import { Document } from './data/Document';
import { Link } from 'react-router-dom';

class DocumentDetails extends React.Component<Document, {}> {
  render() {
    const url = this.props.url;
    
    return (
      <div>
        <iframe 
          id="player" 
          width="100%"
          height="390"
          src={url} 
        />
        <h2>
          {this.props.file}
        </h2>
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
      dataStore.windows.onGet,
      dataStore.windows,
      (talk: Document) => (<DocumentDetails {...talk} />)
    );

    this.right = databind(
      dataStore.windows.onMoreLikeThis,
      dataStore.windows,
      (windows: Document[]) => (
        <MoreLikeThis 
          title="More Like This:"
          docs={windows} 
          render={
            (window: Document) => (
                <table style={{ width: '100%' }}>
                  <tr>
                    <td style={{ width: '50%' }}>
                      <Link to={'/view/' + window.id}>
                        <img 
                          style={{ width: '100%' }}
                          src={window.url} 
                        />
                      </Link>
                    </td>
                    <td>
                      <Link to={'/view/' + window.id}>
                        <b>{window.file}</b>
                      </Link>
                    </td>
                  </tr>
                </table>
              )
            }
        />)
    );

    this.header = databind(
      dataStore.windows.onMoreLikeThis,
      dataStore.windows,
      (talk: Document) => (
        <SearchBox 
          placeholder="Search..."
          loading={false}
        />
      )
    );
  }

  init() {
    dataStore.windows.doGet(this.props.id);
    dataStore.windows.doMoreLikeThis(this.props.id);
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
      <DetailLayout 
        leftComponent={this.left}
        rightComponent={this.right}
        headerComponent={this.header}
      />
    );
  }
}

export { DetailPageApp };