import React from 'react';
import {CSVLink} from "react-csv";
import './styles.css';


class TableExport extends React.Component {

  constructor(props) {
    super(props);
    this.export = this.export.bind(this);
    this.state = {
      exportData: [],
      columns: [],
      fileName: 'table-export'
    };
  }

  export(event) {
    const data = this.props.table.getResolvedState().sortedData;
    const columns = this.props.columns;
    var exportData = []
    for (var rowIndex = 0; rowIndex < data.length; rowIndex++) {
      let exportDatum = {}
      for(var colIndex = 0; colIndex < columns.length ; colIndex ++) {
        exportDatum[columns[colIndex].Header] = data[rowIndex][columns[colIndex].accessor];
      }
      exportData.push(exportDatum);

    }
    this.setState({ exportData: exportData }, () => {
      this.csvLink.link.click()
    })

  }

  render() {
    const exportData = this.state.exportData;
    const fileName = this.props.fileName;
    return (
      <div>
        <button onClick={this.export}>
          Export
        </button>
        <CSVLink
          data={exportData}
          filename={fileName}
          className="hidden"
          ref={(r) => this.csvLink = r}
          target="_blank"/>
      </div>
    );
  }

}

export default TableExport;
