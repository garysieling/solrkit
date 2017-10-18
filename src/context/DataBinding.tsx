import { PaginationData, SolrCore, SolrMoreLikeThis, SolrGet } from './DataStore';
import * as React from 'react';

type RenderLambda<T> = 
  (v: T | T[], p?: PaginationData) => JSX.Element;

function databind<T>(
    fn: Function,
    ds: SolrCore<T>,
    render: RenderLambda<T>
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
  render: RenderLambda<T>;
}

interface DataBoundState<T> {
  data?: T | T[];
  paging?: PaginationData;
}

class DataBound<T> extends React.Component<DataBoundProps<T>, DataBoundState<T>> {
  constructor(props: DataBoundProps<T>) {
    super(props);

    this.state = {
      data: undefined,
      paging: undefined
    };

    // This needs to happen early
    props.fn.call(
      props.dataStore,
      (data: T | T[], paging: PaginationData) => {
        this.setState( {
          data: data,
          paging: paging
        });
      }
    );
  }

  render() {
    // TODO these need to be named or something
    if (!this.state.data) {
      return null;
    }

    return (
      this.props.render(this.state.data || [], this.state.paging)
    );
  }
}

export { databind };