---
id: ali
title: Alibaba Cloud (Aliyun)
sidebar_label: Ali Cloud
slug: /ali
sidebar_position: 4
---

Your Alibaba Cloud Account needs to be configured to allow the application to authenticate and run queries on your usage and billing data via Alibaba Cloud BSS OpenAPI.

1.  **Ensure your Alibaba Cloud account has the correct permissions**

    - Create or use an existing RAM user with the following permissions: 
      - `AliyunBSSFullAccess` 
      - `AliyunBSSReadOnlyAccess`
      - `AliyunBSSOrderAccess`
    
    More information on permissions and resource access control for the BOA API can be found [here](https://www.alibabacloud.com/help/en/bss-openapi/latest/authorize-api-calls?spm=a2c63.p38356.0.0.3a895f3asxTmSB).

2.  **Obtain your Alibaba Cloud credentials**

    - Go to the [Alibaba User Center](https://usercenter.console.aliyun.com/#/manage/ak) to obtain your access key (ALI_ACCESS_KEY) and secret access key (ALI_ACCESS_SECRET).

3.  **Configure API or CLI environment variables**

    - Add the `ALI_ACCESS_KEY` and `ALI_ACCESS_SECRET` variables to the .env file in the API or CLI folder. Reference [packages/api/.env.template](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/api/.env.template) for a template .env file. Rename this file as .env and set the appropriate variables.
    
    - If you are only using Alibaba Cloud, you can remove the environment variables associated with other cloud providers in your `packages/api/.env` file.

4.  **Usage and Billing Data**

    - Usage and billing data is fetched using Alibaba Cloud BSS OpenAPI. Make sure this feature is enabled and configured properly in your Alibaba Cloud account.

5.  **Finally, after performing a `yarn install`, start up the application**

        yarn start

    or 

        yarn start-api

_warning_ This will incur some cost. Use this sparingly if you wish to test with live data. Please refer to [Ali Docs FAQ](https://www.alibabacloud.com/help/en/openapi-explorer/latest/faqs) for more information.
