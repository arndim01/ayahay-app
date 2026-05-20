FROM node:18-alpine AS build

# Install OpenSSL 3.x (default in Alpine 3.21+)
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY . .

RUN yarn set version berry \

    # install dev dependencies to generate prisma files and run nest build
    && yarn workspaces focus @ayahay/api \
    && cd api \
    && yarn prisma generate \
    && yarn run build \
    && cd ../ \

    # remove dev dependencies, but keep prisma files
    && cp -r node_modules/.prisma . \
    && rm -rf node_modules \
    && yarn workspaces focus @ayahay/api --production \
    && cp -r ./.prisma node_modules \
    && rm -rf ./.prisma

######################
##### PRODUCTION #####
######################

FROM node:18-alpine

# Install OpenSSL 3.x (default in Alpine 3.21+)
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/packages /usr/src/app/packages
COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/api/dist /usr/src/app/api

EXPOSE 3001

CMD ["node", "api/main.js"]
