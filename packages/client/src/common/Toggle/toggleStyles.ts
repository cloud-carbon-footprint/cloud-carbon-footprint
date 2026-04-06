/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<void, 'toggle' | 'toggleHandler'>({
  name: 'Toggle',
  uniqId: 'ccf-toggle',
})(({ palette }, _params, classes) => ({
  toggleWrapper: {
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    width: 310,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  toggleInput: {
    position: 'absolute',
    left: '-99em',
    [`&:checked + .${classes.toggle}`]: {
      background: palette.lightBlue,
    },
    [`&:checked + .${classes.toggle}::before`]: {
      color: palette.primaryBlue,
    },
    [`&:checked + .${classes.toggle}::after`]: {
      color: 'white',
    },
    [`&:checked + .${classes.toggle} .${classes.toggleHandler}`]: {
      width: 110,
      transform: 'translateX(110px)',
      borderColor: '#fff',
    },
  },
  toggle: {
    cursor: 'pointer',
    display: 'inline-block',
    position: 'relative',
    width: 220,
    height: 50,
    background: palette.lightBlue,
    borderRadius: 15,
    transition: 'all 200ms cubic-bezier(0.445, 0.05, 0.55, 0.95)',
    '&::after': {
      content: '"kilograms"',
      color: palette.primaryBlue,
      position: 'absolute',
      fontSize: 14,
      zIndex: 2,
      transition: 'all 200ms cubic-bezier(0.445, 0.05, 0.55, 0.95)',
      right: 20,
      top: 15,
    },
    '&::before': {
      content: '"metric tons"',
      color: '#fff',
      position: 'absolute',
      fontSize: 14,
      zIndex: 2,
      transition: 'all 200ms cubic-bezier(0.445, 0.05, 0.55, 0.95)',
      top: 15,
      left: 20,
    },
  },
  toggleHandler: {
    display: 'inline-block',
    position: 'relative',
    zIndex: 1,
    background: '#3F51B5',
    width: 110,
    height: 50,
    borderRadius: 15,
    transition: 'all 200ms cubic-bezier(0.445, 0.05, 0.55, 0.95)',
    transform: 'translateX(0px)',
  },
}))

export default useStyles
