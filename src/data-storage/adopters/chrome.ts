import { assertLastErrorChrome } from '../../utils/assert-last-error';
import { StorageAdopter } from '../decls';

export const defaultAdopterChrome: StorageAdopter = {
  get(keys: string[]): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      chrome.storage.local.get(keys, (values) => {
        try {
          assertLastErrorChrome();
          resolve(keys.map((key) => values[key]));
        } catch (e) {
          reject(e);
        }
      });
    });
  },
  set(value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(value, () => {
        try {
          assertLastErrorChrome();
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  },
  remove(keys: string[]) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(keys, () => {
        try {
          assertLastErrorChrome();
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  }
};
