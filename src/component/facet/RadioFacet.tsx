import * as React from 'react';
import * as _ from 'lodash';

import {
  FacetRenderer,
  defaultRenderer,
  FacetProps
} from './FacetTypes';

class RadioFacet extends React.Component<FacetProps, {}> {
    static contextTypes = {
    searchState: React.PropTypes.object,
    transition: React.PropTypes.func
  };

  onClick(value: [string, number, boolean]) {
    return () => {
      let selections: string[] = [value[0]];
      
      const thisFacet = {};
      thisFacet[this.props.facet] = selections;

      this.context.transition(
        {facets: thisFacet}
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
          _.sortBy(this.props.values, (v) => v[0]).map(
            (value, i) => (
              <div style={{display: 'block'}} className="ui radio checkbox">
                <input onClick={this.onClick(value)} checked={value[2]} type="radio" name="frequency" />
                <label>{render(value[0], value[1])}</label>
              </div>
            )
          )
        }
      </div>
    );
  }
}

export {
  RadioFacet
};