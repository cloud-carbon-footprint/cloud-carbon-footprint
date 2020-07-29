import ServiceWithCPUUtilization from "@domain/ServiceWithCPUUtilization";
import ComputeUsage from "@domain/ComputeUsage";
import UsageData from "@domain/UsageData";

export class RDSService extends ServiceWithCPUUtilization {
    serviceName: string;

    constructor() {
        super()
    }

    getUsage(start: Date, end: Date): Promise<ComputeUsage[]>{
        return undefined;
    }

}
