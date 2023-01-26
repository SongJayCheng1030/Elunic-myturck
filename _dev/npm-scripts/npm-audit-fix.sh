#!/bin/sh

npx concurrently \
    -n "lib,assetmanagerbackend,filebackend,hubbackend,tenantbackend,identitybackend" \
    "npm audit fix" \
    "cd asset-manager-backend/ && npm audit fix" \
    "cd file-backend/ && npm audit fix" \
    "cd hub-backend/ && npm audit fix" \
    "cd tenant-backend/ && npm audit fix" \
    "cd identity-backend/ && npm audit fix"
