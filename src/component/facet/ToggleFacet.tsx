import * as React from 'react';

import {
  FacetRenderer,
  defaultRenderer,
  FacetProps
} from './FacetTypes';

class ToggleFacet extends React.Component<FacetProps, {}> {
  render() {
    const title = this.props.title;
    const render: FacetRenderer = this.props.render || defaultRenderer;

    return (
      <div className="ui" style={{marginBottom: '1em'}}>
        {title ? (<h4>{title}</h4>) : null}
        {
          this.props.values.map(
            (value, i) => (
              <p>
                <div className="ui toggle checkbox">
                  <input type="checkbox" name={i + ''} />
                  <label>{render(value[0], value[1])}</label>
                </div>
              </p>
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