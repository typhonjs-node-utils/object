# Changelog
## 0.5.0 release (major)
- Improved `isObject` / `isPlainObject` type guard / types passthrough.
- Added: 
  - `assertObject`  
  - `assertPlainObject`  
  - `ensureNonEmptyAsyncIterable` 
  - `ensureNonEmptyIterable` 
  - `isRecord` 

## 0.4.0 release (minor)
- Fix regression in  `isPlainObject`.

## 0.3.0 release (minor)
- Added `main` field to package.json (required by `esm-d-ts` for test cases using this package without `node resolve`).

## 0.2.0 release (major)
- Removed several superfluous functions including validation functions.
- Strengthened all functions for Typescript type guards and automatic inference. 
- 100% test coverage.

## 0.1.0 release
- Initial release
