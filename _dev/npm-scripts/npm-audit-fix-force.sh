#!/bin/sh

npx concurrently \
    -n "lib,assetmanagerbackend,filebackend,hubbackend,tenantbackend,identitybackend" \
    "npm audit fix --force" \
    "cd asset-manager-backend/ && npm audit fix --force" \
    "cd file-backend/ && npm audit fix --force" \
    "cd hub-backend/ && npm audit fix --force" \
    "cd tenant-backend/ && npm audit fix --force" \
    "cd identity-backend/ && npm audit fix --force"
