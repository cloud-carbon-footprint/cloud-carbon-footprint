import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
    marginTop: '5em',
    marginBottom: '5em'
  },
  headerCells: {
    backgroundColor: 'black',
    color: 'lightGreen',
    textEmphasis: 'bold',
  },
  rowCells: {
    backgroundColor: 'black',
    color: 'white',
  }
});

interface TableProps {
  data: any
}

function SimpleTable(props: TableProps) {
  const classes = useStyles();
  if(props.data.length == 0) return null

  const header = props.data[0]
  const rows = props.data.slice(1)
  
  return  (
    <TableContainer>
      <Table className={classes.table} aria-label="simple table">
        <TableHead >
          <TableRow>
            {header.map((cell: string, idx: number) => (
              <TableCell key={idx} className={classes.headerCells}>

                {cell}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row: string[]) => (            
          <TableRow key={row[0]}>
            {row.map((cell: string, idx: number) => (
              <TableCell key={idx}>
                {cell}
              </TableCell>
            ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
function App() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch('/api')
      .then(response => response.json())
      .then(response => setData(response))
  }, []);
  
  return (
    <div>
      <Typography variant="h1">
        AWS Emissions and Wattage
      </Typography>
      <SimpleTable data={data}/>
    </div>
  );
}

export default App;
