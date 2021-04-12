## deployment

```bash
ng build --prod
npm run concat
firebase deploy --only hosting:ngel-injector
```

should deploy to https://ng-el-injector.web.app 

## usage
```html
<script src="https://ng-el-injector.web.app/ngel-injector.min.js" defer>

```

## todo: describe `window.__appShellPluginsJson__`
