(window.webpackJsonp=window.webpackJsonp||[]).push([[18],{126:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return f}));var r=n(0),o=n.n(r);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var u=o.a.createContext({}),s=function(e){var t=o.a.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},p=function(e){var t=s(e.components);return o.a.createElement(u.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},b=o.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,i=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),p=s(n),b=r,f=p["".concat(i,".").concat(b)]||p[b]||d[b]||a;return n?o.a.createElement(f,c(c({ref:t},u),{},{components:n})):o.a.createElement(f,c({ref:t},u))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,i=new Array(a);i[0]=b;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:r,i[1]=c;for(var u=2;u<a;u++)i[u]=n[u];return o.a.createElement.apply(null,i)}return o.a.createElement.apply(null,n)}b.displayName="MDXCreateElement"},89:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return c})),n.d(t,"toc",(function(){return l})),n.d(t,"default",(function(){return s}));var r=n(3),o=n(7),a=(n(0),n(126)),i={id:"performance-considerations",title:"Performance Considerations",slug:"/performance-considerations"},c={unversionedId:"performance-considerations",id:"performance-considerations",isDocsHomePage:!1,title:"Performance Considerations",description:"Options to Improve Query Performance",source:"@site/docs/PerformanceConfiguration.md",slug:"/performance-considerations",permalink:"/docs/performance-considerations",version:"current",sidebar:"tryNowSidebar",previous:{title:"Creating a Lookup Table",permalink:"/docs/creating-a-lookup-table"},next:{title:"Configurations Glossary",permalink:"/docs/configurations-glossary"}},l=[{value:"Options to Improve Query Performance",id:"options-to-improve-query-performance",children:[]},{value:"Caching Configurations",id:"caching-configurations",children:[]}],u={toc:l};function s(e){var t=e.components,n=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},u,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("h3",{id:"options-to-improve-query-performance"},"Options to Improve Query Performance"),Object(a.b)("p",null,"When running very large amounts of data with the default configuration of querying each day for the previous year, we have noticed that the time it takes to start the app increases significantly. We have added optional configuration to help with this performance issue to query and date filter in a few different ways:"),Object(a.b)("h4",{id:"date-range"},"Date Range"),Object(a.b)("p",null,"In your ",Object(a.b)("inlineCode",{parentName:"p"},"packages/client/.env")," file, you can provide the following variables for a custom date range:"),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"REACT_APP_DATE_RANGE_TYPE")," (example values: day(s), week(s), month(s), etc..)"),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"REACT_APP_DATE_RANGE_VALUE")," (example values: number correlating to day/week/month etc..)")),Object(a.b)("h4",{id:"group-by-timestamp-in-queries"},"Group By Timestamp in Queries"),Object(a.b)("p",null,"In your ",Object(a.b)("inlineCode",{parentName:"p"},"packages/client/.env")," file, you can provide the following variable for a custom query option to group the data by date type:"),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"REACT_APP_GROUP_BY")," (example values: day, week, month, quarter, year)")),Object(a.b)("p",null,"Please Note: "),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},"Data grouped by time periods other than days will usually honor the time period of the grouping over a specific date range that falls within the range. For example, when data is grouped by month and the dates Oct. 18 - Nov. 12 are requested, the API and UI will return one data point for November that includes all available data for the month of November (1st - 30th). Behavior when requesting specific dates including portions of the group by period may not be consistent due to caching."),Object(a.b)("li",{parentName:"ul"},"Grouping is still configurable in ",Object(a.b)("inlineCode",{parentName:"li"},"packages/api/.env")," with the ",Object(a.b)("inlineCode",{parentName:"li"},"GROUP_QUERY_RESULTS_BY")," option, but this will be deprecated soon.")),Object(a.b)("h3",{id:"caching-configurations"},"Caching Configurations"),Object(a.b)("h4",{id:"ensure-real-time-estimates"},"Ensure real-time estimates"),Object(a.b)("p",null,"In order to make local development a pleasant experience with a quick feedback loop, we have a cache file that is automatically generated. If you would like to see up-to-date estimates, you will have to delete ",Object(a.b)("inlineCode",{parentName:"p"},"packages/cli/estimates.cache.json")," and/or ",Object(a.b)("inlineCode",{parentName:"p"},"packages/api/estimates.cache.json"),". Depending on how much usage you have, it could take several minutes to fetch up-to-date estimates and regenerate the cache file."),Object(a.b)("p",null,"Note: If you don\u2019t see one of these files, don\u2019t worry. Simply start the server, and load the app for the first time."),Object(a.b)("h4",{id:"storing-cache-file"},"Storing cache file"),Object(a.b)("p",null,"Currently, we support storing the cache file with two different options:"),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},"Local filesystem (default, no configuration needed)"),Object(a.b)("li",{parentName:"ul"},"Google Cloud Storage")),Object(a.b)("p",null,"If you are experiencing long load times in your staging or production environments, the option to store the cache file in the cloud and clear it when you would like to re-estimate may be the best option for you. In order to use the Google Cloud option, you have to set the following variables in your ",Object(a.b)("inlineCode",{parentName:"p"},".env")," file:"),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"CACHE_MODE=GCS")),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"GCS_CACHE_BUCKET_NAME=\u201dsome-bucket-name\u201d")),Object(a.b)("p",null,"Note: The Google service account that you are using must have access and permissions to read/write into the bucket."),Object(a.b)("h4",{id:"seeding-cache-file"},"Seeding cache file"),Object(a.b)("p",null,"We have an option to run the server side API calls as a background job. This can be useful for larger amounts of data to query from the cloud providers and will have no timeout limit when running with the browser. Before running the script, you will need to set the necessary configurations in a ",Object(a.b)("inlineCode",{parentName:"p"},".env")," file in the CLI directory."),Object(a.b)("p",null,"From the root directory, run:"),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"yarn seed-cache-file")),Object(a.b)("p",null,"You will then be prompted enter a start date, end date and groupBy parameter. Once this process is finished running. A new cache file will be created in the CLI directory. In order to use the cache file to run with the front-end client package, you will have to copy the cache file to the API directory before starting the application."))}s.isMDXComponent=!0}}]);