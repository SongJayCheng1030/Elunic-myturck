#!/bin/sh

npx concurrently \
    -n "lib,assetmanagerbackend,filebackend,hubbackend,tenantbackend,identitybackend" \
    "npm audit" \
    "cd asset-manager-backend/ && npm audit" \
    "cd file-backend/ && npm audit" \
    "cd hub-backend/ && npm audit" \
    "cd tenant-backend/ && npm audit" \
    "cd identity-backend/ && npm audit"
