import * as React from 'react';
import { SingleComponent } from '../context/DataStore';
import * as _ from 'lodash';

interface ResultsListProps<T> {
  docs: T[];
  render: SingleComponent<T>;

  height?: number;
  columnWidth?: 'one' | 'two' | 'three' | 'four' | 
    'five' | 'six' | 'seven' | 'eight' | 'nine' | 
    'ten' | 'eleven' | 'twelve' | 'thirteen' | 
    'fourteen' | 'fifteen' | 'sixteen';
}

class ResultsList<T> extends React.Component<ResultsListProps<T>> {
  render() {
    const { docs, render, height } = this.props;

    let style = _.get(this.props, 'style', {});
    if (this.props.height) {
      style = _.extend(
        {
          height: height + 'px',
          float: 'left'
        }, 
        style
      );
    }

    // sixteen means one column
    const thisColumnClass = (this.props.columnWidth || 'sixteen') + ' wide column';

    return (
      <div className="ui grid">
        {
          (docs || []).map(
            (doc, i) => 
              <div
                className={thisColumnClass}
                key={i}
                style={style}
              >
                {render(doc, i)}
              </div>
          )
        }
      </div>
    );
  }
}

export {
  ResultsListProps,  
  ResultsList
};