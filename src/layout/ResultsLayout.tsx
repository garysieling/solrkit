import * as React from 'react';

interface ResultsLayoutProps {
  leftComponent?: () => JSX.Element;
  rightComponent?: () => JSX.Element;
  headerComponent?: () => JSX.Element;
  footerComponent?: () => JSX.Element;
  rightRailComponent?: () => JSX.Element;
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

    const rightRailComponent = 
      this.props.rightRailComponent ? (
        <div className="two wide column">
          <div className="container">
            {this.props.rightRailComponent()}
          </div>
        </div>
      ) : null;

    const rightColumns =
      rightRailComponent ? 
        'ten wide column' :
        (leftComponent 
          ? 'twelve wide column' 
          : 'sixteen wide column'
        );
        
    const header = 
      this.props.headerComponent ? (
        <div className="ui segment">
          {headerComponent}
        </div>
      ) : null;

    const leftColumn = 
      leftComponent ? (
      <div className="three wide column">
        <div className="container">
          {leftComponent}
        </div>
      </div>
      ) : null;

    const rightColumn = (
      <div className={rightColumns}>
        <div className="container">
          {rightComponent}
        </div>
      </div>
    );

    return (
      <div className="ui segments" style={{height: '100%'}}>
        {header}
        <div className="main ui segment">
          <div className="ui grid">
            {leftColumn}
            {rightColumn}
            {rightRailComponent}
            <div className="three wide column" />
            <div className="ten wide column">
              {footerComponent}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export { 
  ResultsLayoutProps,
  ResultsLayout
};
