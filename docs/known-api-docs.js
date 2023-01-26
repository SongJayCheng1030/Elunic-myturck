module.exports = [
  {
    "tag": "asset-manager-backend",
    "name": "Assets (core service)",
    "url": {
      "dev": "http://localhost:13001/api/docs-json/",
      "prod": "/service/asset/api/docs-json/"
    }
  },
  {
    "tag": "condition-monitoring-backend",
    "name": "Condition Monitoring",
    "url": {
      "dev": "http://localhost:13002/api/docs-json/",
      "prod": "/service/condition-monitoring/api/docs-json/"
    }
  },
  {
    "tag": "file-backend",
    "name": "Files (core service)",
    "url": {
      "dev": "http://localhost:13003/api/docs-json/",
      "prod": "/service/file/api/docs-json/"
    }
  },
  {
    "tag": "hub-backend",
    "name": "Hub (core service)",
    "url": {
      "dev": "http://localhost:13004/api/docs-json/",
      "prod": "/service/hub/api/docs-json/"
    }
  },
  {
    "tag": "maintenance-backend",
    "name": "Maintenance Manager",
    "url": {
      "dev": "http://localhost:13005/api/docs-json/",
      "prod": "/service/maintenance/api/docs-json/"
    }
  },
  {
    "tag": "identity-backend",
    "name": "Identity backend: users & tenants",
    "url": {
      "dev": "http://localhost:13007/api/docs-json/",
      "prod": "/service/identity/api/docs-json/"
    }
  }
];