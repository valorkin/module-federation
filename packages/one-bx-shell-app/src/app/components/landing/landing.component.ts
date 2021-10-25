import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationObject, RemoteContainerConfiguration } from '@mf/core';

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
  }

  ngOnInit() {
    this.onLoadRemoteContainerConfigurationsFromJsonFile();
  }

  onError(error: Error) {
    console.log(error);
  }

  onAddConfigurationObject(json: ConfigurationObject) {
    window.mfCOs = window.mfCOs || [];
    window.mfCOs.push(json);

    this.isLoaded = false;
    this.changeDetectorRef.detectChanges();

    window.setTimeout(() => {
      this.isLoaded = true;
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
