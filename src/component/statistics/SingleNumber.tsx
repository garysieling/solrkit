import * as React from 'react';
import { Statistic, SemanticCOLORS } from 'semantic-ui-react';

interface SingleNumberProps {
  value: number;
  label: string;
  horizontal?: boolean;
  color?: SemanticCOLORS;
  size?: 'mini' | 'tiny' | 'small' | 'large' | 'huge';
}

class SingleNumber extends React.Component<SingleNumberProps> {
  render() {
    const props = this.props;
    
    return (
      <Statistic 
        horizontal={props.horizontal || false} 
        color={props.color}
        size={props.size || 'tiny'}
      >
        <Statistic.Value>{
          props.value.toLocaleString(
            undefined, { minimumFractionDigits: 0 }
          )
        }</Statistic.Value>
        <Statistic.Label>{props.label}</Statistic.Label>
      </Statistic>
    );
  }
}

export { 
  SingleNumberProps,
  SingleNumber 
};
