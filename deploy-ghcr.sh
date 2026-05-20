#!/bin/bash

# Assumes GHCR credentials are set

image_id=$(docker build -q -t ayahay-api .)

docker tag $image_id ghcr.io/ayahay-technologies-corporation/ayahay-api:latest

docker push ghcr.io/ayahay-technologies-corporation/ayahay-api:latest