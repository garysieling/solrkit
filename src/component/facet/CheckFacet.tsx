import * as React from 'react';

type Value = [string, number];
type Renderer = (v: string, count: number) => (JSX.Element | string);

interface CheckFacetProps {
  title?: string;
  values: Value[];
  render?: Renderer;
}

function defaultRenderer(value: string, count: number): (JSX.Element | string) {
  return value;
}

class CheckFacet extends React.Component<CheckFacetProps, {}> {
  render() {
    const title = this.props.title;
    const render: Renderer = this.props.render || defaultRenderer;

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