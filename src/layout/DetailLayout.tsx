import * as React from 'react';

interface DetailLayoutProps<T> {
  object: T;
  leftComponent: React.ComponentClass<T>;
  rightComponent: React.ComponentClass<T>;
  headerComponent: React.ComponentClass<T>;
}

class DetailLayout<T> extends React.Component<DetailLayoutProps<T>, {}> {
  constructor() {
    super();
  }
  
  render() {
    const headerComponent = 
      React.createElement(
        this.props.headerComponent, 
        this.props.object);
        
    const leftComponent = 
      React.createElement(
        this.props.leftComponent, 
        this.props.object);

    const rightComponent = 
      React.createElement(
        this.props.rightComponent, 
        this.props.object);

    return (
      <div>
        <div className="ui masthead vertical segment">
          <div className="ui container">
            <div className="introduction">
              <h1 className="ui header">
                {headerComponent}
              </h1>
            </div>
          </div>
        </div>
        <div className="main ui intro container">
          <div className="ui grid">
            <div className="ten wide column">
              <div className="container">
                {leftComponent}
              </div>
            </div>
            <div className="two wide column">
              <div className="container">
                {rightComponent}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export { DetailLayout };
