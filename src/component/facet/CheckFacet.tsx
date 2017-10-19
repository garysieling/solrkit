import * as React from 'react';

interface CheckFacetProps {
  title?: string;
  values: string[];
}
class CheckFacet extends React.Component<CheckFacetProps, {}> {
  render() {
    const title = this.props.title;

    return (
      <div className="ui" style={{marginBottom: '1em'}}>
        {title ? (<h4>{title}</h4>) : null}
        {
          this.props.values.map(
            (value, i) => (
              <div style={{display: 'block'}} >
                <div className="ui checkbox">
                  <input type="checkbox" name={i + ''} />
                  <label>{value}</label>
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