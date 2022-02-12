
# Overview

>Note: This Project is currently under active development, so if you are planning to use it in any way, remember to regularly check this documentation.

This project demonstrates how [Module Federation](https://app.gitbook.com/@fundamental-ngx/s/microfrontends/module-federation-getting-started/readme-main) works in Angular based environment. It serves as one of the main sources of truth with examples for internal Ariba SAP project.

Currently we federate 3 different types of Micro Front-end remote applications:

- Angular Components & Modules
- Web Components (Custom Elements)
- iFrame

## Tech Stack

- TypeScript
- Nx
- Angular
- Angular CLI
- ngx-build-plus
- Webpack/ModuleFederationPlugin

## Project Structure

Project consists of 9 independent apps. You can find them in `packages` directory.

There are two main entry points to the applications:

1. `packages/one-bx-shell-app` - wrapper-app around all micro-frontend applications served by different micro services.

- Accessible via https://localhost:4200 once built.

2. `packages/cflp-app/` - this entry point simulates CFLP App environment where we have a Shellbar on the host page and iFrame pointing to the https://localhost:4200

- Accessible via https://localhost:5000 once built

Each application contains `webpack.extra.js` which is used to configure Webpack `ModuleFederationPlugin` to expose components and attach remote urls.

- To learn more about `ModuleFederationPlugin` please see [docs](https://webpack.js.org/concepts/module-federation/)
- To learn more about Module Federation and experiment with setting it up, follow to our [GitBook Module Federation Getting Started Documentation.](https://app.gitbook.com/@fundamental-ngx/s/microfrontends/module-federation-getting-started/readme-main)
  
## Deployment

To deploy this project locally, we will need to build each application separately, and then access `one-bx-shell-app` to see the federated application containing other independent applications.

### Building Applications

To build each application, you need to:

1. Open `packages/{desired-app}` directory, where {desired-app} is the name of an application you want to build.
2. `yarn install` to install necessary dependencies
3. `npm start`
4. Once all apps are built and running, access https://localhost:4200 to see Module Federation in action.
  
## Applications

### one-bx-shell-app

Host application that uses `@fundamenta-ngx/app-shell` components & API in order to dynamically load these applications:

### content-req-app

Remote app exposing `PR List` card shown on the main landing page.
 - Angular component uses `@fundamenta-ngx/core` components

### content-item-app

Remote app exposing `Your Favorite` card shown on the main landing page + `Item Detail Page`. Here we also demonstrate how **Routing** works:

- Using Routing tag (see _ItemDetailPage_)
- Using loadChildren dynamic imports to have sub-routing (see `ItemDetailsModule`)

### nx-app

Remote App show Module Federation with nrwl NX structure `/libs and apps/` .

### iframe-source-website

Remote website used as an iFrame source for `Quick Links` landing page card.

### ngrx-app

Remote angular app using NGRx State management directly on the exposed component and sharing its state with its child components

### content-recommended-categories

Remote App exposing Recommended Categories shown on the dashboard.
