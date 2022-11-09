import * as React from 'react'
import Box from '@mui/material/Box'
import InfoIcon from '@material-ui/icons/Info'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import { ForecastLineChart } from './ForecastLineChart'
import moment from 'moment'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: '25px',
}

export default function LineChartDialog({ forecastData, region }) {
  console.log(forecastData, 'forecastData')
  console.log(region, 'region')
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const data = []
  const categories = []

  const convertUTCtoLocalTime = (utcTime) => {
    const stillUtc = moment.utc(utcTime).toDate()
    const local = moment(stillUtc).local().format('YYYY-MM-DD HH:mm:ss')
    return local
  }

  forecastData.map((forecast) => {
    data.push(forecast.value)
    categories.push(convertUTCtoLocalTime(forecast.timestamp))
  })

  return (
    <div>
      <InfoIcon onClick={handleOpen} data-testid="info-icon"></InfoIcon>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            data-testid="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Forecast for {region}
          </Typography>
          <ForecastLineChart
            data={data}
            categories={categories}
          ></ForecastLineChart>
        </Box>
      </Modal>
    </div>
  )
}
