# Federated Micro Frontend Loader

This is webpack [module federation]-enabled Micro Frontend Loader. It provides a fast first impression gracefully transitioning to a fully loaded page

It is a library that allows you to use remote applications as donors of modules and components for a host application.

## Plugin Launcher

Component which is responsible for downloading, instantiating , and injecting Remote Application in Host Application.

## Adding Micro Frontend Loader To A Project

In order to make our Application Shell work, we need to connect it via `plugins.json` through Plugin Launcher.

1. Open your project's `package.json` file, and add two dependencies:

```json 
 "@fundamental-ngx/app-shell": "^0.2.38",
 "@pscoped/ngx-pub-sub": "^3.0.2",
```

The `@pscoped/ngx-pub-sub` library is a dependency without which our Micro Frontend Loader `@fundamental-ngx/app-shell` library will not work.

1. Install:

`yarn add @pscoped/ngx-pub-sub @fundamental-ngx/app-shell`

1. Now it is time to connect the AppShellModule by adding following code to the `src/app/app.module.ts` file:

```typescript
//...
import { AppShellModule } from '@fundamental-ngx/app-shell';
//...
@NgModule({
  //...
  imports: [
    //...
    AppShellModule.forRoot('assets/plugins.json'),
  ],
  //...
})
export class AppModule { }
```

----

## Run Locally

To get the Micro Frontend Loader up and running locally, in fundamental-ngx folder run: 

`build-local-app-shell`

in your app folder do

`npm i -D ~/path/to/fundamental-ngx/dist/libs/app-shell/`

Don't forget to revert package.json in your app before pushing. Alternatively you can use npm link

`npm link`

##  Start Applications

`npm install`
`npm start`

## View Apps

Open http://localhost:3000 to view

Open http://localhost:3001 to view app shell

Open http://localhost:3002 to view
