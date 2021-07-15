import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RemoteContainerConfiguration } from '@valorkin/ngx-mf-injector/lib/api/module-federation';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  isLoaded = false;

  containers: RemoteContainerConfiguration[];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.onLoadRemoteContainerConfigurationsFromJsonFile();
  }

  onError(error: Error) {
    console.log(error);
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
