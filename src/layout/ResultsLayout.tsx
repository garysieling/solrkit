import * as React from 'react';

interface ResultsLayoutProps {
  leftComponent?: () => JSX.Element;
  rightComponent?: () => JSX.Element;
  headerComponent?: () => JSX.Element;
  footerComponent?: () => JSX.Element;
}

class ResultsLayout extends React.Component<ResultsLayoutProps, {}> {
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

    const footerComponent = 
      this.props.footerComponent ? (
        this.props.footerComponent()
      ) : null;

    return (
      <div className="ui segments">
        <div className="ui segment">
          {headerComponent}
        </div>
        <div className="main ui segment">
          <div className="ui grid">
            <div className="four wide column">
              <div className="container">
                {leftComponent}
              </div>
            </div>
            <div className="twelve wide column">
              <div className="container">
                {rightComponent}
              </div>
            </div>
            <div className="four wide column" />
            <div className="ten wide column">
              {footerComponent}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export { ResultsLayout };
