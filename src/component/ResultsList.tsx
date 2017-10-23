import * as React from 'react';
import { SingleComponent } from '../context/DataStore';
import * as _ from 'lodash';

interface ResultsListProps<T> {
  docs: T[];
  render: SingleComponent<T>;

  evenHeight?: boolean;
  perRow?: number;
  widthColumn?: string;
  heightColumn?: string;
}

class ResultsList<T> extends React.Component<ResultsListProps<T>> {
  render() {
    const { docs, render, evenHeight, perRow, widthColumn, heightColumn } = this.props;

    if (evenHeight && perRow && widthColumn && heightColumn) {
      const groupings = 
        _.groupBy(
          _.map(
            (docs || []),
            (doc, index) => [index, doc, doc[widthColumn], doc[heightColumn]]
          ),
          (record) => {
            const index: number = record[0];
            return Math.floor(index / perRow) + '';
          }
        );

        console.log('groupings', groupings);

      const keys: string[] = _.keys(groupings);
      const widths: number[] = 
        _.map(
          keys,
          (k: string) => 
            _.sum( groupings[k].map( (v) => 1.0 * v[2] * (250.0 / v[3]) ) )
        );

      let idx = 0;
      const allRows = widths.map(
        (row, rowIndex) => (
          <p>
            {
              groupings[rowIndex + ''].map(
                (entry) => {
                  // const thisAspect = entry[2] / 100.0;
                  // const rowWidth: number = row;

                  const netWidth = widths[rowIndex] + (5 * perRow);
                  // const height = 1.0 / thisAspect * (1.0 * netWidth / perRow);

console.log(widths);
                  const desired = 1000;

                  const ht = Math.round(250 * desired / netWidth);
console.log('final', desired, netWidth, ht);
                  return (
                    <div 
                      key={idx++} 
                      style={{
                        height: ht + 'px',
                        padding: '5px',
                        display: 'inline-block'
                      }}
                    >
                      {render(entry[1])}
                    </div>
                  );
                }
              )
            }
          </p>
        )
      );

      return (
        <div>
          {allRows}
        </div>
      );
    } else {
      return (
        <div>
          {
            (docs || []).map(
              (doc, i) => <div key={i}>{render(doc)}</div>
            )
          }
        </div>
      );
    }
  }
}

export {
  ResultsList, 
  ResultsListProps
};