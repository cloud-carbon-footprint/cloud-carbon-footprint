import React from "react"
import useRemoteService from "./hooks/RemoteServiceHook"
import {ApexLineChart} from "./ApexLineChart"

const CloudCarbonContainer = () => {
    const {data, loading, error} = useRemoteService([]);

    return (
        <div>
            <ApexLineChart data={data}/>
        </div>
    )
}

export default CloudCarbonContainer
