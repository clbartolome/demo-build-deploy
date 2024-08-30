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
ansible-navigator run ../uninstall.yaml -m stdout \
    -e "ocp_host=<** e.g.: server.domain.com **>" \
    -e "api_token=<** e.g.: sha256~..... **>"
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

- Go to OCP console (developer view) > +Add > Container images > Create application
- Open Application
- Application will work but weather requests will fail because we have not specified an API key

#### 1.2. Use Dockerfile on OpenShift Builds

- Create a namespace:
```sh
oc new-project containerfile-build
```

- Go to OCP console (develop
er view) > +Add > Import from Git > Create application using Dockerfile  (! Add environment variable `WEATHER_API_KEY`)
- Review build logs
- Application will work 100%
- Review environment variable

#### 1.3. Use Source2Image on OpenShift Builds

- Create a namespace:
```sh
oc new-project s2i-build
```

- Remove existing Dockerfile:
```sh
rm Dockerfile
git commit -am "Dockerfile deleted"
git push # credentials are - gitea:openshift
```

- Review existing images for python:
```sh
oc get is -n openshift
oc get is python -n openshift
oc get is python -n openshift -o yaml 
```

- Visit https://catalog.redhat.com and look for `ubi9/python-311`

- Create application using `oc new-app` command:
```sh
oc new-app --help # review examples
oc new-app --name=weather-app \
  openshift/python:3.11-ubi9~http://gitea-gitea.apps.$OCP_HOST/gitea/weather-app.git \
  --strategy=source --as-deployment-config=false
```

- Review resources:
```sh
oc get pods
oc logs weather-app-1-build -f
oc get all # wrong port and missing route
```

- Fix service and expose via https:
```sh
oc edit svc weather-app # change targetPort to 5000

oc expose svc weather-app
```

- Create a Secret with API key and add it to the deployment:
```sh
oc create secret generic weather-app  --from-literal WEATHER_API_KEY=<key>
oc get secret weather-app -o yaml
echo <base64-key> | base64 -d

oc set env deploy/weather-app --from secret/weather-app

oc get pods # show terminating + new pod
oc rsh weather-app-?? # Access new pod and printenv
```

- Review app is working by accessing the route


### 2. Continuos Integration

### 3. Continuos Delivery

