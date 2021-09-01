# ng-build-expander: expand your workspace from another one

`ng-build-expander` is an Angular build expander that allows you to conveniently expand your current workspace (`angular.json`) from another one. There are `build`, `serve`, `extract-i18n`, and `test` targets available.

## Getting started

### Install correct dependency versions

Requirements:

* Make sure you have `yarn` available on your system;
* Use Angular >=11.0.7;
* Use Webpack >=5.18.0.

#### How to use

Please, carefully read following instructions below to configure `ng-build-expander`:

1. Create two Angular projects using the CLI: `app1` and `app2`
2. Go to `app1` project, create `/projects` directory and move `app2` project there.
3. Go to `app1` root directory and install ng-build-expander using following command: `yarn add @nowant/ng-build-expander`
4. Open `app1` `angular.json` and include `app2` project in `projects` to expand its options, like so:

```json
{
  ...
  "projects": {
    ...
     "app2": {
      "projectType": "application",
      "schematics": {},
      "root": "packages/app2",
      "sourceRoot": "packages/app2/src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@nowant/ng-build-expander:browser",
          "configurations": {
            "production": {}
          }
        },
        "serve": {
          "builder": "@nowant/ng-build-expander:dev-server",
          "options": {
            "port": 4202
          },
          "configurations": {
            "production": {}
          }
        },
        "extract-i18n": {
          "builder": "@nowant/ng-build-expander:extract-i18n"
        },
        "test": {
          "builder": "@nowant/ng-build-expander:karma"
        },
        ...
      }
    }
  }
}
```

5. Now you're able to run following commands from `app1` root directory:

Build commands:

* `ng run app2:build`
* `ng run app2:build --configuration=production`

Serve commands:

* `ng run app2:serve`
* `ng run app2:serve --configuration=production`

Extract i18n commands:

* `ng run app2:extract-i18n`

Test commands:

* `ng run app2:test`

6. Have fun ;)

## Webpack version-specific issues

If you can't install webpack>=5.0.0:

* Remove `node_modules`, `yarn.lock`, `package-lock.json`
* Add following to your `package.json`:

  ```json
  "resolutions": {
    "webpack": "^5.0.0"
  }

* `yarn install`
