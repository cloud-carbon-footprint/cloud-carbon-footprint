/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  toggleWrapper: {
    position: 'relative',
    marginBottom: spacing(1),
    overflow: 'hidden',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: typography.fontWeightBold,
    width: 220,
  },
  label: {
    fontWeight: typography.fontWeightBold,
    textAlign: 'center',
  },
  toggleInput: {
    position: 'absolute',
    left: '-99em',
    '&:checked + $toggle': {
      background: palette.lightBlue,
    },
    '&:checked + $toggle:before': {
      color: palette.primaryBlue,
    },
    '&:checked + $toggle:after': {
      color: 'white',
    },
    '&:checked + $toggle $toggleHandler': {
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
