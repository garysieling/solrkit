import * as React from 'react';
import { DetailLayout } from '../layout/DetailLayout';
import { BoundComponent, DataStore } from '../context/DataStore';
import { keys } from 'lodash';

interface DetailPageProps<T> {
  id: string;
  url: string;
  core: string;
  initial: T;
  leftComponent: BoundComponent<T>;
  rightComponent: BoundComponent<T>;
  headerComponent: BoundComponent<T>;
}

interface DetailPageState<T> {
  object: T;
}

class DetailPage<T> extends React.Component<DetailPageProps<T>, DetailPageState<T>> {
  constructor(props: DetailPageProps<T>) {
    super();

    this.state = {
      object: props.initial
    };

    // TODO this is broken - move into HOC that binds
    //      individual controls to data
    this.dataStore.onGet(
      (data: T) => {
        this.setState( {
          object: data
        });
      }
    );
  }

  componentDidMount() {
    // TODO this is broken - move into HOC that binds
    //      individual controls to data
    this.dataStore.get(
      this.props.id,
      keys(this.props.initial)
    );
  }

  render() {
    // TODO this is broken - move into HOC that binds
    //      individual controls to data
    return (
      <DetailLayout 
        object={this.state.object} 
        leftComponent={undefined/*this.props.leftComponent(this.dataStore)*/} 
        rightComponent={undefined/*this.props.rightComponent(this.dataStore)*/} 
        headerComponent={undefined/*this.props.headerComponent(this.dataStore)*/}
      />
    );
  }
}

export { DetailPage };