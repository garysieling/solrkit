import * as React from 'react';
import { DetailLayout } from '../layout/DetailLayout';
import { DataStore } from '../context/DataStore';

interface DetailPageProps<T> {
  id: string;
  url: string;
  core: string;
  initial: T;
}

interface DetailPageState<T> {
  object: T;
}

class DetailPage<T> extends React.Component<DetailPageProps<T>, DetailPageState<T>> {
  private dataStore: DataStore<T>;

  constructor(props: DetailPageProps<T>) {
    super();

    this.dataStore = new DataStore<T>(
      props.url,
      props.core
    );
    
    this.state = {
      object: props.initial
    };

    this.dataStore.onGet(
      (data: T) => {
        this.setState( {
          object: data
        });
      }
    );
  }

  componentDidMount() {
    this.dataStore.get(
      this.props.id
    );
  }

  render() {
    return (
      <DetailLayout object={this.state.object} />
    );
  }
}

export { DetailPage };