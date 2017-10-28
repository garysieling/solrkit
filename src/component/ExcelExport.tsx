import * as React from 'react';
import { Popup } from 'semantic-ui-react';
import { SolrCore } from '../context/DataStore';

interface ExcelExportProps {
  core: SolrCore<object>;
}

class ExcelExport extends React.Component<ExcelExportProps, {}> {
  constructor() {
    super();

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.core.doExport();
  }

  render() {
    return (
      <Popup
        trigger={
          <i 
            className="cloud download icon" 
            onClick={this.onClick}
          />
        }
        content="Export to Excel"
      />
    );
  }
}

export {
  ExcelExportProps,
  ExcelExport
};