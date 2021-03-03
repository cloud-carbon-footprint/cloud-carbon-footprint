Title — Remove filters api
Decision — remove the filters api
Context
— This api was originally created to have a single source of truth for filters.
- However when running the application was hundreds of Account, Regions and Services it becomes unmanageable to configure these.
- Instead, the client can determine the filters based on the estimation results themselves.
Consequences
— Decouples the client from the server side configuration.
- Potentially slows down the client rendering a bit. 
