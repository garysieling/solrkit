import * as React from 'react';

interface ToggleFacetProps {
  title?: string;
  values: string[];
}
class ToggleFacet extends React.Component<ToggleFacetProps, {}> {
  render() {
    const title = this.props.title;

    return (
      <div className="ui" style={{marginBottom: '1em'}}>
        {title ? (<h4>{title}</h4>) : null}
        {
          this.props.values.map(
            (value, i) => (
              <p>
                <div className="ui toggle checkbox">
                  <input type="checkbox" name={i + ''} />
                  <label>{value}</label>
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