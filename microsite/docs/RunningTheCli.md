---
id: running-the-cli
title: Running the CLI
---

We believe that getting your cloud emissions data should be easy. If you are looking to quickly get an output of data, the CLI is a great option. It allows you to specify exactly what data you’re looking for, including the date range, regions, groupings and output type.

#### Local

    yarn start-cli <options>

#### CLI Options

You can run the tool interactively with the `-i` flag; CLI will ask for the options/parameters

Or you can choose to pass the parameters in a single line:

    --startDate YYYY-MM-DD \
    --endDate YYYY-MM-DD \
    --region [us-east-1 | us-east-2] \
    --groupBy [day | dayAndService | service] \
    --format [table | csv]
