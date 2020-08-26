import React from "react"
import getEstimatesAndCosts from "./hooks/FootprintEstimatorHook"
import {ApexLineChart} from "./ApexLineChart"

const CloudCarbonContainer = () => {
    const {data, loading, error} = getEstimatesAndCosts([]);

    return (
        <div>
            <ApexLineChart data={data}/>
        </div>
    )
}

export default CloudCarbonContainer
