import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ConfigurationObject } from '@mf/core';

/**
 * Class ContainerObserver is responsible to create a channel with Observers per a Configuration Object,
 * removes an Observer from Observers list,
 * removes a whole channel if it has no Observers
 * and emits an event per a Configuration Object
 */
@Injectable({
  providedIn: 'root'
})
export class ContainersObserver {
  private subjects: Map<string, Subject<ConfigurationObject>> = new Map();

  /**
   * Checks whether a container has an Observer
   */
   public has(uuid: string): boolean {
    if (!this.subjects.has(uuid)) {
      return false;
    }

    const observers = this.subjects.get(uuid).observers;
    return observers.length > 0;
  }

  /**
   * Creates a listener per a Configuration Object
   */
  public on(uuid: string, fn: () => {}): Subscription {
    if (!this.subjects.has(uuid)) {
      this.subjects.set(uuid, new Subject<ConfigurationObject>());
    }

    return this.subjects.get(uuid).subscribe(fn);
  }

  /**
   * Removes a listener per a Configuration Object
   */
  public off(uuid: string, subscription: Subscription) {
    subscription.unsubscribe();

    // if we have no Observers we should remove the whole channel
    if (!this.has(uuid)) {
      this.subjects.delete(uuid);
    }
  }

  /**
   * Dispatches an event per a Configuration Object
   */
  public dispatch(uuid: string, configurationObject: ConfigurationObject) {
    if (!this.subjects.has(uuid)) {
      return;
    }

    this.subjects.get(uuid).next(configurationObject);
  }

  /**
   *
   */
  public dispatchAll(configurationObject: ConfigurationObject) {
    this.subjects.forEach((subject) => {
      subject.next(configurationObject);
    });
  }
}
