# demo-build-deploy

Demo to show up how OpenShift can help with applications build and deploy tasks

## Install

### Pre-requisites
- OpenShift GitOps Operator installed with default configuration

### Deployment
- Open a terminal
- Access installation->ansible-navigator: `cd installation/ansible-navigator`
- Run installation:
```sh
ansible-navigator run ../install.yaml -m stdout \
    -e "ocp_host=<** e.g.: server.domain.com **>" \
    -e "api_token=<** e.g.: sha256~..... **>"
```
- Review installed resources in final playbook message

### Uninstall

- Open a terminal
- Access installation->ansible-navigator: `cd installation/ansible-navigator`
- Run uninstallation: 
```sh

```

## Demo

Configure host as an environment variable: `OCP_HOST=<** e.g.: server.domain.com **>`

### 1. Images

#### 1.1. Use Existing Image

- Clone application from gitea:
```sh
cd /tmp

git clone http://gitea-gitea.apps.$OCP_HOST/gitea/weather-app.git
```

- Build image:
```sh
cd weather-app

podman build -t weather-app .

podman images

podman tag weather-app quay.io/calopezb/weather-app:1.0-30082024 #Use current date for tag

podman login quay.io
podman push quay.io/calopezb/weather-app:1.0-30082024 #Use current date for tag
```

- Go to [quay](quay.io) and review tagged image

- Create a namespace:
```sh
oc new-project existing-image
```

- Go to OCP console and review existing image method for creating an application
- Application will work but weather requests will fail because we have not specified an API key

#### 1.2. Use Dockerfile on OpenShift Builds

TODO

#### 1.3. Use Source2Image on OpenShift Builds

TODO

### 2. Continuos Integration

### 3. Continuos Delivery

