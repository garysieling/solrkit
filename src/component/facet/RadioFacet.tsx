import * as React from 'react';

interface RadioFacetProps {
  title?: string;
  values: string[];
}

class RadioFacet extends React.Component<RadioFacetProps, {}> {
  render() {
    const title = this.props.title;

    return (
      <div className="ui" style={{marginBottom: '1em'}}>
        {title ? (<h4>{title}</h4>) : null}
        {
          this.props.values.map(
            (value, i) => (
              <div style={{display: 'block'}} className="ui radio checkbox">
                <input type="radio" name="frequency" />
                <label>{value}</label>
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