/*
 * © 2021 ThoughtWorks, Inc.
 */

import program from 'commander'

import createApp from './createApp'

const main = (argv: string[]) => {
  program.name('ccf-create-app')

  program.description('Creates a new app in a new directory').action(createApp)

  program.parse(argv)
}

process.on('unhandledRejection', (error) => {
  process.stderr.write(`\n${error}\n\n`)
  process.exit(1)
})

main(process.argv)
