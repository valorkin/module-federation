import { JsonObject } from '@angular-devkit/core';

export interface BuilderOptions extends JsonObject {
  project: string;
}

export interface JsonObjectMaps {
  [key: string]: JsonObject;
}
