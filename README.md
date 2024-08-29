# demo-build-deploy

Demo to show up how OpenShift can help with applications build and deploy tasks

## Install

### Pre-requisites
- OpenShift GitOps Operator installed with default configuration

### Deployment
- Open a terminal
- Login into OpenShift with an admin rights user
- Access installation->ansible-navigator: `cd installation/ansible-navigator`
- Run installation: `ansible-navigator run ../install.yaml -m stdout`
- Review installed resources in final playbook message

### Uninstall

- Open a terminal
- Login into OpenShift with an admin rights user
- Access installation->ansible-navigator: `cd installation/ansible-navigator`
- Run uninstallation: `ansible-navigator run ../uninstall.yaml -m stdout`

## Demo

### 1. Build Image

### 2. Continuos Integration

### 3. Continuos Delivery

