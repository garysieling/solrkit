import * as React from 'react';

interface DetailLayoutProps<T> {
  object: T;
}

class DetailLayout<T> extends React.Component<DetailLayoutProps<T>, {}> {
  constructor() {
    super();
  }
  
  render() {
    return (
      <div className="ui container">

        <h1>Theming Examples</h1>
        
        {JSON.stringify(this.props.object)}

        <h2 className="ui dividing header">Site</h2>

        <h2 className="ui dividing header">Menu</h2>

        <h2 className="ui dividing header">Buttons</h2>

        <h2 className="ui dividing header">Table</h2>

        <h2 className="ui dividing header">Input</h2>

        <h2 className="ui dividing header">Card</h2>

      </div>

    );
  }
}

export { DetailLayout };
