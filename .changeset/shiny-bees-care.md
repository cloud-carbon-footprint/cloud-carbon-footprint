---
'@cloud-carbon-footprint/client': minor
---

Updates the filter options to be a fixed header:

`packages/client/src/dashboard/charts/ApexBarChart.tsx`:

```diff
    // ...

    import React, { ReactElement } from 'react'
    import { Container } from '@material-ui/core'
+ import { makeStyles } from '@material-ui/core/styles'
    import { Switch, Route } from 'react-router-dom'
    import ErrorPage from './dashboard/ErrorPage'
    import CloudCarbonContainer from './dashboard/CloudCarbonContainer'
    import { CarbonFormulaDrawer } from './dashboard/CarbonFormulaDrawer'
    import HeaderBar from './dashboard/HeaderBar'

    function App(): ReactElement {
+   const useStyles = makeStyles(() => ({
+     appContainer: {
+       padding: 0,
+     },
+   }))
+
+   const classes = useStyles()
+
    return (
        <>
        <HeaderBar />

-       <Container maxWidth={'xl'}>
+       <Container maxWidth={'xl'} className={classes.appContainer}>
            <Switch>
            <Route path="/error" exact>
                <ErrorPage />

    // ...
```

`packages/client/src/dashboard/CloudCarbonContainer.tsx`:

```diff
    // ...

    const useStyles = makeStyles((theme) => ({
    boxContainer: {
    padding: theme.spacing(3, 10),
+   marginTop: 62,
+ },
+ filterHeader: {
+   top: 0,
+   left: 'auto',
+   position: 'fixed',
+   marginTop: '64px',
+   width: '100%',
+   backgroundColor: '#fff',
+   borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
+   zIndex: 1199,
+   padding: '9px 10px 7px 10px',
    },
    filterContainer: {
    display: 'flex',
    flexWrap: 'wrap',
-   paddingBottom: theme.spacing(1),
+   justifyContent: 'center',
    },
    filter: {
    resize: 'none',
-   padding: theme.spacing(PADDING_FILTER),
-   paddingLeft: 0,
+   padding: '2px 4px 0 4px',
    marginRight: theme.spacing(PADDING_FILTER),
    minWidth: '240px',
    },

    // ...

    </div>
    </Grid>
    ) : (
-   <div className={classes.boxContainer}>
-     <Grid container>
+   <>
+     <div className={classes.filterHeader}>
        <Grid item xs={12}>
            <div className={classes.filterContainer}>

    // ...

                </div>
                </div>
            </Grid>
-         <Grid container spacing={3}>
-           <Grid item xs={12}>
-             <Card style={{ width: '100%', height: '100%' }}>
-               <Box padding={3} paddingRight={4}>
-                 {filteredData.length ? (
-                   <ApexLineChart data={filteredData} />
-                 ) : (
-                   <div className={classes.noData}>
-                     <p>Cloud Usage</p>
-                     <NoDataPage isTop={true} />
-                   </div>
-                 )}
-               </Box>
-             </Card>
-           </Grid>
-           <Grid item xs={12}>
-             <Grid
-               container
-               spacing={3}
-               style={{
-                 display: 'flex',
-                 flexDirection: 'row',
-                 flexWrap: 'wrap-reverse',
-               }}
-             >
-               <Grid item className={classes.gridItemCards}>
-                 <CarbonComparisonCard data={filteredData} />
-               </Grid>
-               <Grid item className={classes.gridItemCards}>
-                 <EmissionsBreakdownContainer data={filteredData} />
+       </div>
+       <div className={classes.boxContainer}>
+         <Grid container>
+           <Grid container spacing={3}>
+             <Grid item xs={12}>
+               <Card style={{ width: '100%', height: '100%' }}>
+                 <Box padding={3} paddingRight={4}>
+                   {filteredData.length ? (
+                     <ApexLineChart data={filteredData} />
+                   ) : (
+                     <div className={classes.noData}>
+                       <p>Cloud Usage</p>
+                       <NoDataPage isTop={true} />
+                     </div>
+                   )}
+                 </Box>
+               </Card>
+             </Grid>
+             <Grid item xs={12}>
+               <Grid
+                 container
+                 spacing={3}
+                 style={{
+                   display: 'flex',
+                   flexDirection: 'row',
+                   flexWrap: 'wrap-reverse',
+                 }}
+               >
+                 <Grid item className={classes.gridItemCards}>
+                   <CarbonComparisonCard data={filteredData} />
+                 </Grid>
+                 <Grid item className={classes.gridItemCards}>
+                   <EmissionsBreakdownContainer data={filteredData} />
+                 </Grid>
                </Grid>
                </Grid>
            </Grid>
            </Grid>
-       </Grid>
-     </div>
+       </div>
+     </>
    )
    }
```
