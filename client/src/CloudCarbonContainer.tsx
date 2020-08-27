import React from "react"
import useRemoteService from "./hooks/RemoteServiceHook"
import {ApexLineChart} from "./ApexLineChart"

const CloudCarbonContainer = () => {
    const {data, loading, error} = useRemoteService([], "2020-08-26", "2020-08-27");

    return (
        <div>
            <ApexLineChart data={data}/>
        </div>
    )
}

export default CloudCarbonContainer
