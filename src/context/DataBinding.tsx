import { SolrCore, SolrMoreLikeThis, SolrGet } from './DataStore';
import * as React from 'react';

function databind<T>(
    fn: Function,
    ds: SolrCore<T>,
    render: 
      (v: T | T[]) => JSX.Element | null
) {
  return () => {
      return (
        <DataBound
          fn={fn}
          dataStore={ds}
          render={render}
        />
      );
    };
}

interface DataBoundProps<T> {
  fn: Function;
  dataStore: SolrGet<T> & SolrMoreLikeThis<T>;
  render: (props: T | T[] | undefined) => JSX.Element | null;
}

interface DataBoundState<T> {
  data?: T | T[];
}

class DataBound<T> extends React.Component<DataBoundProps<T>, DataBoundState<T>> {
  constructor(props: DataBoundProps<T>) {
    super(props);

    this.state = {};

    // This needs to happen early
    props.fn.call(
      props.dataStore,
      (data: T | T[]) => {
        this.setState( {
          data: data
        });
      }
    );
  }

  render() {
    // TODO these need to be named or something
    return (
      this.props.render(this.state.data)
    );
  }
}

export { databind };