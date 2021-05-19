import { exec as execCb } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execCb)

const { dependencies } from './packaage.json'

async function main() {

    const packageNams = process.argv.slice(2)
    console.log(packageNames)

    // const { Project } = require('@lerna/project');
    // const { PackageGraph } = require('@lerna/package-graph');
    //
    // const project = new Project('../dist-workspace')
    // const packages = await project.getPackages();
    // const graph = new PackageGraph(packages);
    //
    // const node = graph.get(`@cloud-carbon-footprint/${packageName}`);
    // if (!node) {
    //     throw new Error(`Package '${packageName}' not found`);
    // }
    for (const package in packageNams) {
        await runCmd(`cp ../${package} .`)
        // pull the package.json in memory as a JS object
        // Update the depedancies for all p

        dependencies[`@cloud-footprint/${package}`] = `./${package}]`

        // OR

        const packeFile = fs.Read('package.json')

        // Make sure the package.json file is writen to, toi update the references
    }


    //work on this to look for cloud carbon dependencies and change the relase dependency to the local one

    // const pkgDeps = Object.keys(node.pkg.dependencies ?? {});
    // const localDeps: string[] = Array.from(node.localDependencies.keys());
    // const filteredDeps = localDeps.filter(dep => pkgDeps.includes(dep));

    // searchNames.push(...filteredDeps);

}

const runCmd = async (cmd: string) => {
    try {
        await exec(cmd)
    } catch (error) {
        process.stdout.write(error.stderr)
        process.stdout.write(error.stdout)
        throw new Error(`Could not execute command ${cmd}`)
    }
}

main().catch((error) => {
    console.error(error.stack)
    process.exit(1)
})
