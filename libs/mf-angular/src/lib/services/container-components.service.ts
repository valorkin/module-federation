import { Injectable } from '@angular/core';
import { ConfigurationObject } from '@mf/core';

interface IContainerComponent {
  container: string;
  module: string;
  containerUuid: string;
  resolve: Function;
}

@Injectable({
  providedIn: 'root'
})
export class ContainerComponentsService {
  private components: IContainerComponent[] = [];

  /**
   *
   */
  public run() {
    this.components.forEach((component) => {
      component.resolve();
    })
  }

  /**
   *
   */
  public runByName(name: string) {
    this.components.forEach((component) => {
      if (name === component.container) {
        component.resolve();
      }
    });
  }

  /**
   *
   */
  public runByContainer(configurationObject: ConfigurationObject) {
    const {uuid, name} = configurationObject;

    this.components.forEach((component) => {
      if (uuid === component.containerUuid) {
        component.container = name;
        component.resolve();
      }
    });
  }

  /**
   *
   */
  public use(component: IContainerComponent) {
    if (this.has(component)) {
      return;
    }

    this.components.push(component);
  }

  /**
   *
   */
  public unuse(component: IContainerComponent) {
    const index = this.find(component);

    if (index < 0) {
      return;
    }

    this.components.splice(index, 1);
  }

  /**
   *
   */
  public has(component: IContainerComponent): boolean {
    const index = this.find(component);
    return index > -1;
  }

  /**
   *
   */
  public findByUuid(uuid: string): number {
    return this.components.findIndex((componentNext) => {
      return uuid === componentNext.containerUuid;
    });
  }

  /**
   *
   */
  private find(component: IContainerComponent): number {
    return this.components.findIndex((componentNext) => {
      return component === componentNext;
    });
  }
}
