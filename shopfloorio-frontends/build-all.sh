#!/bin/sh

NG_PROJECTS_DIR="./projects"
LIB_NAME="sio-common"
DOCKER_TAG_NAME="latest"
OUT_DIR=".."

# ---

function help () {
  echo "Usage: $0 DOCKER_TAGNAME [SINGLE_FRONTEND]"
  echo " "
  echo " where:"
  echo "   - DOCKER_TAGNAME  -- is the name of the docker tag to create the docker"
  echo "                        image under (required), e.g. latest"
  echo "   - SINGLE_FRONTEND -- an optional parameter to build a single frontend. If"
  echo "                        not provided all frontends are build. Example: app-hub"
  echo "                        to only build the hub frontend"
  echo " "
}

function error_and_exit () {
  echo '\e[31m'
  echo "+++++++ ERROR +++++++"
  echo "$1"
  echo "+++++++ ERROR +++++++"
  echo '\e[0m'
  exit 1
}

function build_project () {
  PROJECT="$1"

  # We don't want to build a frontend for the lib
  IS_LIB=$(echo "${PROJECT}" | grep "${LIB_NAME}" | wc -l)
  if [[ "$IS_LIB" -gt "0" ]]; then
    echo "Skipping ${PROJECT}, because is marked as a library"
    continue;
  fi

  IMAGE_NAME=$(cat docker/image-name.map | grep "${PROJECT}" | cut -d ' ' -f 2)
  if [[ "${IMAGE_NAME}z" == "z" ]]; then
    IMAGE_NAME="${PROJECT}"
  fi

  # Start the build process
  echo "--> Building: ${PROJECT} as ${IMAGE_NAME}:${DOCKER_TAG_NAME}"

  # Angular build
  npm run "build:${PROJECT}"
  if [ $? -ne 0 ]; then
      error_and_exit "The build process for the application ${PROJECT} failed. Please check the error above."
  fi

  # Docker image build
  docker build -t ${IMAGE_NAME}:${DOCKER_TAG_NAME} -f Dockerfile.instant --build-arg APP_NAME=${PROJECT} .
  if [ $? -ne 0 ]; then
      error_and_exit "The docker image for the application ${PROJECT} could not be built. Please check the error above."
  fi

  # Save the image as file
  docker save ${IMAGE_NAME}:${DOCKER_TAG_NAME} | gzip > "${OUT_DIR}/${IMAGE_NAME}.tgz"
  if [ $? -ne 0 ]; then
      error_and_exit "Failed to save docker image for project ${PROJECT} (${IMAGE_NAME}:${DOCKER_TAG_NAME}). Please check the error above."
  fi

  echo "Done with ${PROJECT}."
}

# ---

if [[ "$#" -lt "1" ]] || [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]] || [[ "$1" == "-help" ]] || [[ "$1" == "help" ]] ; then
  echo "Error: at least a docker tag name is required as an argument."
  echo " "
  help
  exit 2
fi

# Prepare dynamic variables
if [[ "$1z" != "z" ]] ; then
  DOCKER_TAG_NAME="$1"
fi

export DOCKER_BUILDKIT="0"

# Install node modules
if [[ ! -d "node_modules" ]] ; then
  echo "--> Installing node_modules ..."
  npm i
fi

# Actual build
if [[ "$2z" != "z" ]] ; then
  echo "--> Building only the frontend $2 as per request"
  build_project "$2"
else 
  # Loop through all projects and build
  for PROJECT in `ls -1 "${NG_PROJECTS_DIR}"`; do
    build_project "${PROJECT}"
  done
fi

# Done
ls -lah ${OUT_DIR}/*.tgz

echo "Done."