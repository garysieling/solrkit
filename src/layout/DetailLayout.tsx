import * as React from 'react';

interface DetailLayoutProps<T> {
  object: T;
  detailComponent: React.ComponentClass<T>;
}

class DetailLayout<T> extends React.Component<DetailLayoutProps<T>, {}> {
  constructor() {
    super();
  }
  
  render() {
    console.log(this.props.object);
    const comp = this.props.detailComponent;
    const detailComponent = 
      React.createElement(comp, this.props.object);

    return (
      <div className="ui container">
        {detailComponent}
      </div>

    );
  }
}

export { DetailLayout };
