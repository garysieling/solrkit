import * as React from 'react';
import { DetailLayout } from '../../../layout/DetailLayout';
import { SearchBox } from '../../../component/SearchBox';
import { AppDataStore } from './data/AppDataStore';
import { databind } from '../../../context/DataBinding';
import { Document } from './data/Document';

class DocumentDetails extends React.Component<Document, {}> {
  render() {
    // [[214, 269, 250, 233], [262, 305, 298, 269]]
    const rects = 
      JSON.parse(this.props.faces).map(
        ([top, right, bottom, left]) => (
          <div 
            style={{
              position: 'absolute',
              top: (top + 14) + 'px',
              left: (left + 14) + 'px',
              width: (right - left) + 'px',
              height: (bottom - top) + 'px',
              borderWidth: '4px',
              borderColor: 'red',
              borderStyle: 'solid'
            }}
          />
        )
      );
      
    return (
      <div>
        <div style={{ float: 'left' }}>
          <img src={this.props.url} />
          {rects}
        </div>
        <div style={{ float: 'left', paddingLeft: '20px' }}>
          <b>URL:</b> {this.props.url}<br />
          <b>Width:</b> {this.props.width}<br />
          <b>Height:</b> {this.props.height}<br />
          <b>Aspect:</b> {this.props.aspect / 100.0}<br />
          <b>Faces:</b> {this.props.face_count}<br />
          <b>Tags:</b> {this.props.resnet50_tags}<br />
          <b>Job:</b> {this.props.place}<br />

        </div>
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
      (talk: Document) => (
        <DocumentDetails {...talk} />
      )
    );
    
    this.header = databind(
      dataStore.windows.onGet,
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
    dataStore.windows.doGet(this.props.id.replace(/_/g, '/'));
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