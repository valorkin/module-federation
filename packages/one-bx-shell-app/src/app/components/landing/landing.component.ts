import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ConfigurationObject,
  RemoteContainerConfiguration,
  addModuleFederatedApps,
  addModuleFederatedAppAsync,
  updateModuleFederatedAppAsync,
  isSynchronized
} from '@mf/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  isLoaded = false;

  containers: RemoteContainerConfiguration[] = [];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient
  ) {
    //
    window.addEventListener('mf-ext-popup-opened', () => {
      this.dispatchUpdateToChromeExtEvent();
    }, false);

    //
    window.addEventListener('mf-ext-add-configuration-object', (event: CustomEvent) => {
      this.onAddConfigurationObject(event.detail);
    }, false);

    //
    window.addEventListener('mf-ext-update-configuration-object', (event: CustomEvent) => {
      this.onUpdateConfigurationObject(event.detail);
    }, false);

    /*window.mfCore.hooks.containers.aborted = () => {
      console.log('aborted');

      if (!this.isLoaded) {
        this.toggleRenderingModuleFederatedApps(true);
      }
    }

    window.mfCore.hooks.containers.loaded = () => {
      console.log('loaded');

      if (!this.isLoaded) {
        this.toggleRenderingModuleFederatedApps(true);
      }
    }*/
  }

  ngOnInit() {
    if (!isSynchronized()) {
      return this.onLoadRemoteContainerConfigurationsFromJsonFile();
    }

    this.isLoaded = true;
  }

  onError(error: Error) {
    console.log(error);
    this.dispatchUpdateToChromeExtEvent();
  }

  onResolve() {
    this.dispatchUpdateToChromeExtEvent();
  }

  onAddConfigurationObject(configurationObject: ConfigurationObject) {
    // Case sync (bad)
    /*window.mfCOs = window.mfCOs || [];
    window.mfCOs.push(configurationObject);

    if (configurationObject.active) {
      this.toggleRenderingModuleFederatedApps(false);

      window.setTimeout(() => {
        this.isLoaded = true;
        this.dispatchUpdateToChromeExtEvent();
      });
    }*/

    this.toggleRenderingModuleFederatedApps(false);

    addModuleFederatedAppAsync(configurationObject)
      .finally(() => {
        this.toggleRenderingModuleFederatedApps(true);
        this.dispatchUpdateToChromeExtEvent();
      });
  }

  onUpdateConfigurationObject(configurationObject: ConfigurationObject) {
    this.toggleRenderingModuleFederatedApps(false);

    updateModuleFederatedAppAsync(configurationObject)
      .finally(() => {
        this.toggleRenderingModuleFederatedApps(true);
        this.dispatchUpdateToChromeExtEvent();
      });
  }

  onLoadRemoteContainerConfigurationsFromJsonFile() {
    // https://mf-demo-one-bx-shell-app.web.app/assets/config/plugins.json
    const uri = 'http://localhost:4200/assets/config/plugins.json';

    this.http.get<RemoteContainerConfiguration[]>(uri)
      .subscribe(
        (containers) => {
          this.isLoaded = true;
          this.containers = containers;
          addModuleFederatedApps(containers);
        },
        () => {
          this.isLoaded = false;
          this.onError(
            new Error(
              `LandingRemoteContainerConfigurationsJsonFileLoadingError: An error occurred while loading ${uri} file`
            )
          );
        }
      );
  }

  private toggleRenderingModuleFederatedApps(isLoaded: boolean) {
    this.isLoaded = isLoaded;
    this.changeDetectorRef.detectChanges();
  }

  private dispatchUpdateToChromeExtEvent() {
    window.postMessage({
      action: 'mf-ext-configuration-objects-updated',
      payload: window.mfCOs.map((co) => {
        return {
          uuid: co.uuid,
          uri: co.uri,
          name: co.name,
          active: co.active,
          hasError: co.hasError,
          definitionUri: co.definitionUri,
          version: co.version
        }
      })
    }, "*");
  }
}
