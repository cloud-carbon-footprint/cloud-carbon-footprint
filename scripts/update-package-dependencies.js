
async function main() {

    const packageName = process.argv.slice(2)

    const { Project } = require('@lerna/project');
    const { PackageGraph } = require('@lerna/package-graph');

    const project = new Project('../dist-workspace')
    const packages = await project.getPackages();
    const graph = new PackageGraph(packages);

    const node = graph.get(`@cloud-carbon-footprint/${packageName}`);
    if (!node) {
        throw new Error(`Package '${packageName}' not found`);
    }

    //work on this to look for cloud carbon dependencies and change the relase dependency to the local one 

    // const pkgDeps = Object.keys(node.pkg.dependencies ?? {});
    // const localDeps: string[] = Array.from(node.localDependencies.keys());
    // const filteredDeps = localDeps.filter(dep => pkgDeps.includes(dep));

    // searchNames.push(...filteredDeps);

}

main().catch((error) => {
    console.error(error.stack)
    process.exit(1)
})
