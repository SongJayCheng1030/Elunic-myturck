# shopfloor.io Asset Management Service

## Features

The shopfloor.io Asset Manager Service provides the following powerful functionalities to enable the user to handle their assets:

 - Handling assets with their basic information (Name, ISA95 equipment type, image, description, ...)
 - Ability to attach multiple documents to an asset`*`
 - Ability to add _aliases_ to an asset (in the form of arbitrary string) for which can be queried
   - This is intended to be used to add additional identification markers e.g. of machines and recognize an asset by e.g. scanning an existing barcoded already attached to the machine after adding this alias to the asset
   - Per tenant only one asset can have the same alias but an asset can have multiple aliases (uniqness)
 - Assets can be soft-deleted and continue to exist in the background
 - All changes on an asset are stored as "activity logs" for traceability
 - Asset Types organize assets into groups and can be created/updated/deleted and contain basic information of the asset type
 - Multiple assets can be assigned to an asset type
 - An asset type can extend another asset type and inherits the properties (see below)
 - The ISA95 asset types are created by default and can be used and modified by the user (see [ISA95 asset structure ISO/IEC 996/07](https://www.researchgate.net/profile/Goekan-May/publication/310659261/figure/fig7/AS:617139522252807@1524148936601/ISA-95-equipment-hierarchy-model.png))
 - A generic asset type is always created to be used if no other asset type applies
 - Assets are organized in a hierarchy in the form of an _asset tree_
 - Assets can be added to and removed from the asset tree
 - The assets inside the asset tree can be ordered
 - All actions are performed on a transaction basic and always check for possible issues like loops or islands inside the tree
 - Before every change a revsion of the current asset tree along with the coming transformations is saved for traceability reason
 - API endpoints are exclusively available to fetch all existing revisions and extract details
 - For asset types properties can be defined
   - Properties are key-value-pairs where the value is typed to string, number, date or a file reference
 - If an asset type inherits another one also the properties are inherited and the values are possible overwritten
 - For assets the properties are defined by the asset type the asset belongs to
   - The property value can be overwritten for every asset individually
 - Asset properties support variable substitution
   - e.g. a properties value can be: `Hello ${TXT}` and another can be `TXT=World` where the result for the first is then `Hello World`
   - This can be nested
   - Is very useful to compose properties where a specific value comes e.g. from the asset but the using property is defined on the asset type
 - All names / language dependent values support "multilang" values of the type `[ISO 639-1 language code, 2 chars, lowercase]-[ISO 3166-1 region code, uppercase, optional]`
 - All actions are available through a powerful REST API following [Richardson Maturity Model Level 2](https://martinfowler.com/articles/richardsonMaturityModel.html#level2)

Legend:

 - `*` - For storing documents the shopfloor.io File Service is required, as it is responsible for data storage. shopfloor.io is built on a microservice architecture to be powerful and scalable
