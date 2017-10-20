import * as React from 'react';

import {
  FacetRenderer,
  defaultRenderer,
  FacetProps
} from './FacetTypes';

class CheckFacet extends React.Component<FacetProps, {}> {
  render() {
    const title = this.props.title;
    const render: FacetRenderer = this.props.render || defaultRenderer;

    return (
      <div className="ui" style={{marginBottom: '1em'}}>
        {title ? (<h4>{title}</h4>) : null}
        {
          this.props.values.map(
            ([value, count], i) => (
              <div style={{display: 'block'}} >
                <div className="ui checkbox">
                  <input type="checkbox" name={i + ''} />
                  <label>{render(value, count)}</label>
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
  CheckFacet
};