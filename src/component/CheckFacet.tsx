import * as React from 'react';
import { Checkbox } from 'semantic-ui-react';

interface CheckFacetProps {
  values: string[];
}
class CheckFacet extends React.Component<CheckFacetProps, {}> {
  render() {
    return (
      <div>
        {
          this.props.values.map(
            (value, i) => (
              <p>
                <Checkbox label={value} />                
              </p>
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