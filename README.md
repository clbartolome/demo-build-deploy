# demo-build-deploy

Demo to show up how OpenShift can help with applications build and deploy tasks

> [!IMPORTANT]  
> Last working versions: 
> - OpenShift: 4.16.13
> - OpenShift GitOps: 1.14.0
> - OpenShift Pipelines: 1.15.1 

## Install

### Pre-requisites
- OpenShift GitOps Operator installed with default configuration
- OpenShift Pipelines Operator installed with default configuration
- Tekton CLI installed in your laptop


### Deployment
- Open a terminal
- Access installation->ansible-navigator: `cd installation/ansible-navigator`
- Run installation:
```sh
ansible-navigator run ../install.yaml -m stdout -e "ocp_host=<** e.g.: server.domain.com **>" -e "api_token=<** e.g.: sha256~..... **>"
```
- Review installed resources in final playbook message

### Uninstall

- Open a terminal
- Access installation->ansible-navigator: `cd installation/ansible-navigator`
- Run uninstallation: 
```sh
ansible-navigator run ../uninstall.yaml -m stdout -e "ocp_host=<** e.g.: server.domain.com **>" -e "api_token=<** e.g.: sha256~..... **>"
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
oc new-project demo1
```

- Go to OCP console (developer view) > +Add > Container images > Create application
- Open Application
- Application will work but weather requests will fail because we have not specified an API key

#### 1.2. Use Dockerfile on OpenShift Builds

- Create a namespace:
```sh
oc new-project demo2
```

- Go to OCP console (develop
er view) > +Add > Import from Git > Create application using Dockerfile  (! Add environment variable `WEATHER_API_KEY`)
- Review build logs
- Application will work 100%
- Review environment variable

#### 1.3. Use Source2Image on OpenShift Builds

- Create a namespace:
```sh
oc new-project demo3
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
oc new-app --name=demo3 \
  openshift/python:3.11-ubi9~http://gitea-gitea.apps.$OCP_HOST/gitea/weather-app.git \
  --strategy=source --as-deployment-config=false
```

- Review resources:
```sh
oc get pods
oc logs demo3-1-build -f
oc get all # wrong port and missing route
```

- Fix service and expose via https:
```sh
oc edit svc demo3 # change targetPort to 5000

oc expose svc demo3
```

- Create a Secret with API key and add it to the deployment:
```sh
oc create secret generic demo3  --from-literal WEATHER_API_KEY=<key>
oc get secret demo3 -o yaml
echo <base64-key> | base64 -d

oc set env deploy/demo3 --from secret/demo3

oc get pods # show terminating + new pod
oc rsh demo3-?? # Access new pod and printenv
```

- Add Python logo:
```sh
oc label deploy demo3 app.openshift.io/runtime=python
```

- Review app is working by accessing the route

### 2. Continuos Integration

#### 2.1. Review Tekton Steps, Tasks and Pipelines

- Create a namespace and a folder locally:
```sh
oc new-project tekton-review

mkdir /tmp/tekton
cd /tmp/tekton
```

- Create a task for printing a message:
```sh
cat << EOF | oc apply -f  -
apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: demo-task
spec:
  params:
    - name: MESSAGE
  results:
    - name: MESSAGE_DATE
  steps:
    - name: print-message
      image: registry.access.redhat.com/ubi8/ubi-minimal:8.3
      script: |
        echo "$(params.MESSAGE)"
    - name: get-date
      image: registry.access.redhat.com/ubi8/ubi-minimal:8.3
      script: |
        DATE="$(date)"
        echo $DATE
        echo $DATE > "$(results.MESSAGE_DATE.path)"
EOF
```

- Create and test the task:

```sh
tkn task list
tkn task start demo-task
tkn taskrun list
tkn taskrun logs demo-task-run-j662m -f
oc get pods
oc logs demo-task-run-xxxxx-pod
oc logs demo-task-run-xxxxx-pod -c step-print-message
oc logs demo-task-run-xxxxx-pod -c step-get-date
```

- Create a pipeline:

```sh
cat << EOF | oc apply -f  -
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: demo-pipeline
spec:
  params:
    - name: MESSAGE
  tasks:
    - name: task-1
      taskRef:
        kind: Task
        name: demo-task
      params:
        - name: MESSAGE
          value: $(params.MESSAGE)
    - name: task-2
      runAfter:
        - task-1
      taskRef:
        kind: Task
        name: demo-task
      params:
        - name: MESSAGE
          value: "$(tasks.task-1.results.MESSAGE_DATE)"
EOF
```

- Create and test the pipeline:

```sh
tkn pipeline list
tkn pipeline start demo-pipeline
tkn pipelinerun logs demo-pipeline-run-xxxxx -f
tkn pipeline list
oc get pods
```

#### 2.2. Review CICD Pipeline (Tekton)

- Review the pipelines created in **ci-cd-demo** namespace

- Retrieve webhook service url:
```sh
oc get svc -n ci-cd-demo
```

- Configure gitea webhooks for application push events in master branch (using installation information values):
  - Open Gitea and login.
  - Open `weather-app`
  - Create a webhook in `Settings > Webhooks > Add Webhook`
  - Target URL must be *http://??.ci-cd-demo.svc.cluster.local:8080*
  - HTTP Method must be `POST`
  - POST Content Type must be `application/json`
  - Secret can be any value
  - Trigger On `Push Events`

- Make an update in application like changing POM version
- Follow the triggered pipeline in OpsnShift console (Wait to review the ArgoCD part in next section)


### 3. Continuos Delivery

#### 3.1. Creat an ArgoCD application

We're going to use the application resources created in section [1.3. Use Source2Image on OpenShift Builds](#1.3.-use-source2image-on-openshift-builds)

- Go to Gitea and create a repository named `demo-argo`

- Go to demo3 namespace and clone previous repo:
```sh
oc project demo3

cd /tmp
git clone http://gitea-gitea.apps.$OCP_HOST/gitea/demo-argo.git

cd demo-argo
```

- Add a liveness probe:
```sh
oc set probe deploy/demo3 --liveness --get-url=http://:5000/health

oc describe deploy demo3
```

- Get application deployment
```sh
oc get deploy demo3 -o yaml > deployment.yaml
vi deployment.yaml
```
  Cleanup deployment:
  - Delete everything in `metadata` but `metadata.name` , `metadata.label` and `metadata.annotations` (connect to)
  - Delete everything in `spec` but:
    - `spec.replicas`
    - `spec.template`
  - Delete everything in `spec.template` but:
    - `spec.replicas`
    - `spec.template`
  - Delete everything in `spec.template.spec.containers` but:
    - `spec.template.spec.containers.name`
    - `spec.template.spec.containers.image` (replace by `quay.io/calopezb/weather-app:??`)
    - `spec.template.spec.containers.imagePullPolicy`
    - `spec.template.spec.containers.livenessProbe`
    - `spec.template.spec.containers.ports` leave just 5000
    - `spec.template.spec.containers.readinessProbe` leave just 5000
  - Delete everything in `status`
  
- Download service:
```sh
oc get svc demo3 -o yaml > service.yaml
vi service.yaml
```

  Cleanup service:
  - Delete everything in `metadata` but `metadata.name`
  - Delete everything in `spec` but `spec.ports` and leave just 8080
  - Delete everything in `status`

- Download route:
```sh
oc get route demo3 -o yaml > route.yaml
vi route.yaml
```

- Cleanup route
  - Delete everything in `metadata` but `metadata.name`
  - Delete everything in `spec` but:
    - `spec.to`
    - `spec.port`
  - Delete everything in `status`

- Download secret:
```sh
oc get secret demo3 -o yaml > secret.yaml
vi secret.yaml
```

- Cleanup secret:
  - Delete everything in `metadata` but `metadata.name`
  - Delete everything in `status`

- Push changes
```sh
# Add files
git add .
git status

# Commit and push
git commit -m "Created resources"
git push
```

- Create a namespace:
```sh
oc new-project argo-review
```

- Create ArgoCD application
  - Access argoCD
  - Click **+ NEW APP** button
  - Use this values:
    - Application Name: `demo-argo`
    - Project Name: `default`
    - Sync Policy: Automatic (with self heal)
    - Source:
      - Repository URL: `http://gitea.gitea.svc.cluster.local:3000/gitea/weather-deploy`
      - Revision: `master`
      - Path: ``
    - Destination:
      - Cluster URL: `https://kubernetes.default.svc`
      - Namespace: `argo-review`

- Review deployment and application


#### 3.2. Review CICD Pipeline (ArgoCD)

> [!NOTE]  
> At this point previously triggered pipeline should has finished.

- Go to Gitea > weather-deploy repository
- Review:
  - Main app
  - Environments `*.json`
  - Kustomized resources
- Open weather-deploy tags/releases and check images created and link to Openshift pipeline
- GO to ArgoCD and check latest changes to see how new version has been deployed

