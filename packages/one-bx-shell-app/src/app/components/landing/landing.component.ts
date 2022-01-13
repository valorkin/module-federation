import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  RemoteContainerConfiguration,
  addModuleFederatedApps,
  isSynchronized
} from '@mf/core';

import { ContainerComponentsService } from '@mf/angular';
@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements AfterViewInit {

  isRemoved = false;

  containers: RemoteContainerConfiguration[] = [];

  constructor(
    private http: HttpClient,
    private containerComponentsService: ContainerComponentsService
  ) {}

  ngAfterViewInit(): void {
    if (!isSynchronized()) {
      return this.onLoadRemoteContainerConfigurationsFromJsonFile();
    }
  }

  onError(error: Error) {
    console.log(error);
  }

  onRemove() {
    this.isRemoved = true;
  }

  onLoadRemoteContainerConfigurationsFromJsonFile() {
    // https://mf-demo-one-bx-shell-app.web.app/assets/config/plugins.json
    const uri = 'http://localhost:4200/assets/config/plugins.json';

    this.http.get<RemoteContainerConfiguration[]>(uri)
      .subscribe((containers) => {
          this.containers = containers;
          addModuleFederatedApps(containers);
          this.containerComponentsService.run();
        },
        () => {
          this.onError(
            new Error(
              `LandingRemoteContainerConfigurationsJsonFileLoadingError: An error occurred while loading ${uri} file`
            )
          );
        }
      );
  }
}
