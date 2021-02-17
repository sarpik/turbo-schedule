# Deploying

We'll deploy the [kipras/turbo-schedule](https://hub.docker.com/r/kipras/turbo-schedule) docker image on a single VPS.

## I. Setting up a VPS

Refer to the latest documentation/tutorial on how to setup a nodejs/docker application on some VPS, i.e. digital ocean.

Here's a backup of guides that were used at the time I setup my server that I still use to this day to host turbo-schedule:

https://github.com/kiprasmel/ubuntu-server-setup

You'll need almost everything from there if you're starting fresh, except `#6` - instead of a nodejs app, we'll just use our docker image.

## II. One-time prerequisites

### II 1. nginx config

<++>

### II 2. (persistant) docker volumes

<++>

### II 3. SSL

<++>

## Running & updating the container image

```sh
docker stop turbo-schedule # error ok
docker rename turbo-schedule turbo-schedule.old # error ok if previous also errored
docker run \
	-p 7000:5000 \
	--detach \
	--name turbo-schedule \
	--mount source=turbo-schedule--generated,target=/usr/src/app/server/generated \
	--mount source=turbo-schedule--database,target=/usr/src/app/database/data \
	kipras/turbo-schedule && \
docker rm turbo-schedule.old # error ok if prev-previous also errored
```
