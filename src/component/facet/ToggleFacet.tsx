import * as React from 'react';
import * as _ from 'lodash';

import {
  FacetRenderer,
  defaultRenderer,
  FacetProps,
  FacetValue
} from './FacetTypes';

class ToggleFacet extends React.Component<FacetProps, {}> {
  static contextTypes = {
    searchState: React.PropTypes.object,
    transition: React.PropTypes.func
  };
  
  onClick(value: FacetValue) {
    return () => {
      let selections: string[] = [];
      if (value.checked) {
        selections = [];
      } else {
        selections.push(value.value);
      }

      const thisFacet = {};
      thisFacet[this.props.facet] = selections;

      this.context.transition(
        {
          start: 0,
          facets: thisFacet
        }
      );
    };
  }

  render() {
    const title = this.props.title;
    const render: FacetRenderer = this.props.render || defaultRenderer;

    return (
      <div className="ui" style={{marginBottom: '1em'}}>
        {title ? (<h4>{title}</h4>) : null}
        {
          _.sortBy(this.props.values, (v) => v[0]).filter(
            !this.props.initialValues ? _.stubTrue : (
              (row: FacetValue) => 
                _.includes(this.props.initialValues, row.value)
            )
          ).map(
            ({ value, count, checked }, i) => (              
              <div key={i}>
                <div className="ui toggle checkbox">
                  <input 
                    checked={checked} 
                    type="checkbox" 
                    name={i + ''} 
                    onClick={this.onClick({value, count, checked})} 
                  />
                  <label onClick={this.onClick({value, count, checked})}>{render(value, count)}</label>
                </div>
              </div>
            )
          )
        }
      </div>
    );
  }
}

export {
  ToggleFacet
};