#!/bin/sh

npx concurrently \
    -n "lib,assetmanagerbackend,filebackend,hubbackend,tenantbackend,identitybackend" \
    "npm audit --production" \
    "cd asset-manager-backend/ && npm audit --production" \
    "cd file-backend/ && npm audit --production" \
    "cd hub-backend/ && npm audit --production" \
    "cd tenant-backend/ && npm audit --production" \
    "cd identity-backend/ && npm audit --production" \
