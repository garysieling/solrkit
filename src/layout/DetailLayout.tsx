import * as React from 'react';

interface DetailLayoutProps {
  leftComponent?: () => JSX.Element;
  rightComponent?: () => JSX.Element;
  headerComponent?: () => JSX.Element;
}

class DetailLayout extends React.Component<DetailLayoutProps, {}> {
  constructor() {
    super();
  }
  
  render() {
    const headerComponent = 
      this.props.headerComponent ? (
        this.props.headerComponent()
      ) : null;
        
    const leftComponent = 
      this.props.leftComponent ? (
        this.props.leftComponent()
      ) : null;

    const rightComponent = 
      this.props.rightComponent ? (
        this.props.rightComponent()
      ) : null;

    return (
      <div className="ui segments">
        <div className="ui segment">
          {headerComponent}
        </div>
        <div className="main ui segment">
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
