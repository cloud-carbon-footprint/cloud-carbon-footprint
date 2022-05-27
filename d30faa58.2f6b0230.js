(window.webpackJsonp=window.webpackJsonp||[]).push([[37],{111:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return r})),n.d(t,"metadata",(function(){return i})),n.d(t,"toc",(function(){return u})),n.d(t,"default",(function(){return c}));var a=n(3),o=n(7),s=(n(0),n(126)),r={id:"classifying-usage-types",title:"Classifying Usage Types",slug:"/classifying-usage-types"},i={unversionedId:"classifying-usage-types",id:"classifying-usage-types",isDocsHomePage:!1,title:"Classifying Usage Types",description:"In order to estimate the energy and carbon emissions for a given amount of cloud provider usage, we need to first classify a row of usage as either Compute, SSD Storage, HDD Storage, Networking or Memory. It's also possible that the usage row is unknown, which we have a process or reclassify here, or unsupported, in which case the application ignores these rows. To understand the steps involved in the classification, please see the methodology page. Once the application has classified the usage row, it then uses the associated usage amount when estimating energy and carbon emissions.",source:"@site/docs/ClassifyingUsageTypes.md",slug:"/classifying-usage-types",permalink:"/docs/classifying-usage-types",version:"current",sidebar:"tryNowSidebar",previous:{title:"Methodology",permalink:"/docs/methodology"},next:{title:"Embodied Emissions",permalink:"/docs/embodied-emissions"}},u=[{value:"Handling Unknown Usage Types",id:"handling-unknown-usage-types",children:[{value:"Applying the Kilowatt-hour/Cost Coefficient",id:"applying-the-kilowatt-hourcost-coefficient",children:[]}]}],l={toc:u};function c(e){var t=e.components,n=Object(o.a)(e,["components"]);return Object(s.b)("wrapper",Object(a.a)({},l,n,{components:t,mdxType:"MDXLayout"}),Object(s.b)("p",null,"In order to estimate the energy and carbon emissions for a given amount of cloud provider usage, we need to first classify a row of usage as either Compute, SSD Storage, HDD Storage, Networking or Memory. It's also possible that the usage row is unknown, which we have a process or reclassify ",Object(s.b)("a",{parentName:"p",href:"/docs/classifying-usage-types#handling-unknown-usage-types"},"here"),", or unsupported, in which case the application ignores these rows. To understand the steps involved in the classification, please see the ",Object(s.b)("a",{parentName:"p",href:"/docs/methodology#1-using-billing-data-for-cloud-usage-holistic"},"methodology page"),". Once the application has classified the usage row, it then uses the associated usage amount when estimating energy and carbon emissions."),Object(s.b)("p",null,"In order to make these classification decisions, we pulled all the various types of usage rows that Thoughtworks has utilized into a spreadsheet for analysis. We then researched each type of usage using publicly available information from the cloud providers about the underlying services, often looking at documentation regarding payment/costs as this often gives hints as to the usage type. We have published these usage types and the various classifications in ",Object(s.b)("a",{parentName:"p",href:"https://docs.google.com/spreadsheets/d/1rMt1lb3G23JnwbAODCka1ohrbl-4pELFSqi6xwwW4q4/"},"this spreadsheet")," with detailed notes and links to sources when available. "),Object(s.b)("p",null,"Given that these usage types have been derived from Thoughtworks' usage, there may be usage types missing that aren't currently supported. If this is case for when using the application, please see instructions for adding unsupported usage types in the documentation for your cloud provider: ",Object(s.b)("a",{parentName:"p",href:"/docs/aws#unsupported-usage-types"},"AWS"),", ",Object(s.b)("a",{parentName:"p",href:"/docs/gcp#unsupported-usage-types"},"GCP")," and ",Object(s.b)("a",{parentName:"p",href:"/docs/azure#unsupported-usage-types"},"Azure"),". We welcome feedback any/all on these classifications."),Object(s.b)("h2",{id:"handling-unknown-usage-types"},"Handling Unknown Usage Types"),Object(s.b)("p",null,"Currently, the application is built to support the energy and carbon emissions estimations for Compute, Storage, Networking and Memory usage types. For the purpose of this documentation, these should be considered \u201cknown\u201d usage types. Per cloud provider, there is a unique list of services and usage types that we intentionally classify as \u201cUnsupported\u201d. Some of these we do not intend to estimate energy usage, (i.e. Refunds, or License fees)."),Object(s.b)("p",null,"There are, however, a number of billing line items that may not meet the criteria to be classified with a high degree of confidence as compute, storage, networking or memory - despite us having confidence there is energy and carbon emissions associated with them. This can be the case with higher level managed services where we have little information about the underlying infrastructure provisioned. For these line items, we have developed an approach that estimates energy and carbon emissions using usage amount (GCP, Azure) or cost (AWS) as a proxy. For each of these line items we identify the best fit known usage type by looking at the service and usage unit, then use the average kilowatt-hour per dollar of that best fit usage type to calculate the energy, using the line item\u2019s usage amount or cost depending on the cloud provider."),Object(s.b)("h3",{id:"applying-the-kilowatt-hourcost-coefficient"},"Applying the Kilowatt-hour/Cost Coefficient"),Object(s.b)("p",null,"For each \u201cknown\u201d usage type, we dynamically build the average kilowatt-hour per usage amount (or cost for AWS) for each unique service and usage unit combination, then multiply that by the usage amount (or cost for AWS) for any unknown rows. We also track the totals to be used for unknown rows that do not match a known service and usage unit combination. Here are these steps in more detail, using GCP services and usage units as an example:"),Object(s.b)("ol",null,Object(s.b)("li",{parentName:"ol"},"For known usage rows, track usageAmount and kilowattHour per service and usage unit, accumulating the values. The result looks something like this:")),Object(s.b)("pre",null,Object(s.b)("code",{parentName:"pre"},"{\n  kubernetesEngine: {\n    seconds: {\n      usageAmount: 10,\n      kilowattHours: 100,\n},\n    bytes: {\n      usageAmount: 20,\n      kilowattHours: 200,\n}\n},\n  computeEngine: {...},\n  totals: {\n    seconds: {\n      usageAmount: 50,\n      kilowattHours: 1000,\n},\n  bytes: {...},\n}\n")),Object(s.b)("ol",{start:2},Object(s.b)("li",{parentName:"ol"},"For each unknown row, if there is a known usageAmount/kilowattHours ratio with the same service and usage unit, multiply the usageAmount by the ratio to determine the estimated kilowatt hours. Then convert that to CO2e based on Google\u2019s published grid emission and carbon free energy percentage, per data center. For example, if we had this \u201cunknown\u201d row using the example data in the previous bullet, the estimated kilowatt-hours would be 100 / 10 * 300 = 3000 kilowatt-hours:")),Object(s.b)("table",null,Object(s.b)("thead",{parentName:"table"},Object(s.b)("tr",{parentName:"thead"},Object(s.b)("th",{parentName:"tr",align:null},"Service name"),Object(s.b)("th",{parentName:"tr",align:null},"Usage unit Value"),Object(s.b)("th",{parentName:"tr",align:null},"Usage amount"))),Object(s.b)("tbody",{parentName:"table"},Object(s.b)("tr",{parentName:"tbody"},Object(s.b)("td",{parentName:"tr",align:null},"kubernetesEngine"),Object(s.b)("td",{parentName:"tr",align:null},"seconds"),Object(s.b)("td",{parentName:"tr",align:null},"300")))),Object(s.b)("ol",{start:3},Object(s.b)("li",{parentName:"ol"},"If there is no same service name and usage unit, then we multiply the usage amount by KWh/usage unit ratio for total usage with that usage unit. For example, if we had this \u201cunknown\u201d row using the example data in the first bullet, the estimated kilowatt-hours would be 1000 / 50 * 400 = 8000 kilowatt-hours:")),Object(s.b)("table",null,Object(s.b)("thead",{parentName:"table"},Object(s.b)("tr",{parentName:"thead"},Object(s.b)("th",{parentName:"tr",align:null},"Service name"),Object(s.b)("th",{parentName:"tr",align:null},"Usage unit Value"),Object(s.b)("th",{parentName:"tr",align:null},"Usage amount"))),Object(s.b)("tbody",{parentName:"table"},Object(s.b)("tr",{parentName:"tbody"},Object(s.b)("td",{parentName:"tr",align:null},"appEngine"),Object(s.b)("td",{parentName:"tr",align:null},"seconds"),Object(s.b)("td",{parentName:"tr",align:null},"400")))),Object(s.b)("h4",{id:"why-we-use-cost-for-aws-instead"},"Why we use cost for AWS instead:"),Object(s.b)("p",null,"In the case of AWS, we track and accumulate known Kilowatt-hours and cost, rather than the Kilowatt-hours and usage amount. We then multiple the cost of unknown usage by these dynamic coefficients. This is because there is no column for \u201cusage unit\u201d in the AWS Cost and Usage Reports, only a \u201cpricing unit\u201d. This means we are unable to use the usage amount to estimate kilowatt hours as we don\u2019t know what usage unit we should multiply it by to estimate Kilowatt-hours."),Object(s.b)("p",null,"We welcome any and all feedback on this approach, or suggestions for entirely different approaches to handling Unknown cloud usage."))}c.isMDXComponent=!0},126:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return g}));var a=n(0),o=n.n(a);function s(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){s(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function u(e,t){if(null==e)return{};var n,a,o=function(e,t){if(null==e)return{};var n,a,o={},s=Object.keys(e);for(a=0;a<s.length;a++)n=s[a],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(a=0;a<s.length;a++)n=s[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=o.a.createContext({}),c=function(e){var t=o.a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=c(e.components);return o.a.createElement(l.Provider,{value:t},e.children)},h={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},d=o.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,s=e.originalType,r=e.parentName,l=u(e,["components","mdxType","originalType","parentName"]),p=c(n),d=a,g=p["".concat(r,".").concat(d)]||p[d]||h[d]||s;return n?o.a.createElement(g,i(i({ref:t},l),{},{components:n})):o.a.createElement(g,i({ref:t},l))}));function g(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var s=n.length,r=new Array(s);r[0]=d;var i={};for(var u in t)hasOwnProperty.call(t,u)&&(i[u]=t[u]);i.originalType=e,i.mdxType="string"==typeof e?e:a,r[1]=i;for(var l=2;l<s;l++)r[l]=n[l];return o.a.createElement.apply(null,r)}return o.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"}}]);