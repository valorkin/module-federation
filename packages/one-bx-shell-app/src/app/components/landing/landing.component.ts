import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ConfigurationObject,
  RemoteContainerConfiguration,
  addModuleFederatedAppAsync,
  updateModuleFederatedAppAsync
} from '@mf/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  isLoaded = false;

  containers: RemoteContainerConfiguration[];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient
  ) {
    window.addEventListener('mf-ext-add-configuration-object', (event: CustomEvent) => {
      this.onAddConfigurationObject(event.detail.payload);
    }, false);

    window.addEventListener('mf-ext-popup-opened', (event: CustomEvent) => {
      console.log(event.detail.extensionId);
      this.dispatchUpdateToChromeExtEvent(event.detail.extensionId);
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
    this.onLoadRemoteContainerConfigurationsFromJsonFile();
  }

  onError(error: Error) {
    console.log(error);
  }

  onAddConfigurationObject(configurationObject: ConfigurationObject) {
    configurationObject.active = true;

    // Case sync (bad)
    window.mfCOs = window.mfCOs || [];
    window.mfCOs.push(configurationObject);

    if (configurationObject.active) {
      this.toggleRenderingModuleFederatedApps(false);

      window.setTimeout(() => {
        this.isLoaded = true;
        //this.dispatchUpdateToChromeExtEvent();
      });
    }

    // Case async (good)
    /*if (configurationObject.active) {
      addModuleFederatedAppAsync(configurationObject)
        .finally(() => {
          this.toggleRenderingModuleFederatedApps(true);
          this.dispatchUpdateToChromeExtEvent();
        });
    }*/
  }

  onUpdateConfigurationObject(configurationObject: ConfigurationObject) {
    if (configurationObject.active) {
      this.toggleRenderingModuleFederatedApps(false);
    }

    updateModuleFederatedAppAsync(configurationObject)
      .finally(() => {
        if (configurationObject.active) {
          this.toggleRenderingModuleFederatedApps(true);
          //this.dispatchUpdateToChromeExtEvent();
        }
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

  private dispatchUpdateToChromeExtEvent(extensionId: string) {
    /*const event = new CustomEvent(
      'mf-ext-update-configuration-object',
      {
        detail: window.mfCOs
      }
    );

    window.dispatchEvent(event);*/

    /*if(chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(
        extensionId,
        { payload: window.mfCOs }
      );
    }*/

    window.postMessage({
      action: 'mf-ext-update-configuration-object',
      payload: window.mfCOs
    }, "*");
  }
}
