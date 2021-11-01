import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ConfigurationObject,
  RemoteContainerConfiguration,
  addModuleFederatedAppsAsync
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
    window.addEventListener('mf-ext-add-form-configuration-object', (event: CustomEvent) => {
      this.onAddConfigurationObject(event.detail);
    }, false);

    window.mfCore.hooks.containers.aborted = () => {
      console.log('aborted');
    }

    window.mfCore.hooks.containers.loaded = () => {
      console.log('loaded');
    }

    window.mfCore.hooks.configurations.updated = () => {
      console.log('updated');
    }
  }

  ngOnInit() {
    this.onLoadRemoteContainerConfigurationsFromJsonFile();
  }

  onError(error: Error) {
    console.log(error);
  }

  onAddConfigurationObject(json: ConfigurationObject) {
    this.isLoaded = false;
    this.changeDetectorRef.detectChanges();

    addModuleFederatedAppsAsync(json)
      .finally(() => {
        this.isLoaded = true;
        this.changeDetectorRef.detectChanges();
      });
  }

  onLoadRemoteContainerConfigurationsFromJsonFile = async () => {
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
}
