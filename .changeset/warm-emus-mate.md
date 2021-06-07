---
'@cloud-carbon-footprint/api': minor
'@cloud-carbon-footprint/cli': minor
'@cloud-carbon-footprint/client': minor
'@cloud-carbon-footprint/core': minor
'@cloud-carbon-footprint/create-app': minor
---

Extract logic into the new packages: app, common, gcp, aws, azure:

There are many files that have been updated/extracted.
In order to update create-app templates, refer to the follow [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/8c6aaed52e9f3949e134852986d50362aad3367a).

The following changes were made to,
'packages/create-app/templates/default-app/packages/client/tsconfig.json':

```
    ...
        "skipLibCheck": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
-        "strict": true,
        "forceConsistentCasingInFileNames": true,
        "module": "esnext",
        "moduleResolution": "node",
        "resolveJsonModule": true,
-        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx",
-        "noFallthroughCasesInSwitch": true
+        "noFallthroughCasesInSwitch": true,
+        "strict": false,
+        "isolatedModules": true
      },
-      "include": [
-        "src",
-        "node_modules/apexcharts/types/apexcharts.d.ts"
-      ]
+      "include": ["src"]
    }
    ...
```

Additionally, the following dependencies have been updated and should also be updated in their respective template package.json file:
- @cloud-carbon-footprint root package.json:
  - "@types/fs-extra": "^9.0.11"
  - "concurrently": "^6.2.0"
  - "marked": ">=2.0.5"
- @cloud-carbon-footprint/api and @cloud-carbon-footprint/cli:  
  - "dotenv": "^10.0.0"
  - "@cloud-carbon-footprint/app": Can be added with `yarn up @cloud-carbon-footprint/app`
  - "@cloud-carbon-footprint/common": Can be added with `yarn up @cloud-carbon-footprint/common`
- @cloud-carbon-footprint/client:
    - "dotenv": "^10.0.0"
    - "@testing-library/react-hooks": "^7.0.0"
    - "concurrently": "^6.2.0"
    - "@cloud-carbon-footprint/common": Can be added with `yarn up @cloud-carbon-footprint/common`
    
