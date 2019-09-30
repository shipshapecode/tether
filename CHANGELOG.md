# Changelog

## [v2.0.0-beta.3](https://github.com/shipshapecode/tether/tree/v2.0.0-beta.3) (2019-09-30)

[Full Changelog](https://github.com/shipshapecode/tether/compare/v2.0.0-beta.2...v2.0.0-beta.3)

**Implemented enhancements:**

- Option to disable `position: fixed` [\#152](https://github.com/shipshapecode/tether/issues/152)
- Use type-check utils instead of typeof [\#333](https://github.com/shipshapecode/tether/pull/333) ([rwwagner90](https://github.com/rwwagner90))
- Move TetherBase and use imports [\#328](https://github.com/shipshapecode/tether/pull/328) ([rwwagner90](https://github.com/rwwagner90))
- Split out some utils [\#325](https://github.com/shipshapecode/tether/pull/325) ([rwwagner90](https://github.com/rwwagner90))
- More offset utils and tests [\#319](https://github.com/shipshapecode/tether/pull/319) ([rwwagner90](https://github.com/rwwagner90))
- Move offset to utils, add tests, test getClass [\#318](https://github.com/shipshapecode/tether/pull/318) ([rwwagner90](https://github.com/rwwagner90))
- Refactor rollup config, add tests for pin and out-of-bounds [\#317](https://github.com/shipshapecode/tether/pull/317) ([rwwagner90](https://github.com/rwwagner90))
- Move deferred utils to their own file [\#315](https://github.com/shipshapecode/tether/pull/315) ([rwwagner90](https://github.com/rwwagner90))

**Fixed bugs:**

- Uglify breaks library: "Super expression must either be null or a function, not undefined" [\#298](https://github.com/shipshapecode/tether/issues/298)
- production build with angular cli \(uglify\) results in `undefined` error [\#295](https://github.com/shipshapecode/tether/issues/295)
- Does not compile with parcel-bundler [\#284](https://github.com/shipshapecode/tether/issues/284)
- Tether not initialize window.Tether when loaded by ReqireJS [\#257](https://github.com/shipshapecode/tether/issues/257)
- Can't disable classes [\#253](https://github.com/shipshapecode/tether/issues/253)
- Duplicate Identifiers within Tether.js Library [\#206](https://github.com/shipshapecode/tether/issues/206)
- Remove classes when set to false [\#329](https://github.com/shipshapecode/tether/pull/329) ([rwwagner90](https://github.com/rwwagner90))

**Closed issues:**

- Action required: Greenkeeper could not be activated 🚨 [\#304](https://github.com/shipshapecode/tether/issues/304)
- Import of Evented from TetherBase.Utils instead of global scope [\#261](https://github.com/shipshapecode/tether/issues/261)
- SVGAnimatedString is not defined [\#201](https://github.com/shipshapecode/tether/issues/201)
- Option to not append to the body [\#189](https://github.com/shipshapecode/tether/issues/189)
- UglifyJS warnings [\#183](https://github.com/shipshapecode/tether/issues/183)
- Clean up on destroy [\#36](https://github.com/shipshapecode/tether/issues/36)

**Merged pull requests:**

- Document events [\#331](https://github.com/shipshapecode/tether/pull/331) ([rwwagner90](https://github.com/rwwagner90))
- Add test for fixed anchoring on scroll [\#330](https://github.com/shipshapecode/tether/pull/330) ([chuckcarpenter](https://github.com/chuckcarpenter))
- Remove facebook example [\#327](https://github.com/shipshapecode/tether/pull/327) ([rwwagner90](https://github.com/rwwagner90))
- chore: Remove example of 3rd party lib [\#326](https://github.com/shipshapecode/tether/pull/326) ([chuckcarpenter](https://github.com/chuckcarpenter))
- Bump eslint-plugin-ship-shape from 0.6.0 to 0.7.1 [\#324](https://github.com/shipshapecode/tether/pull/324) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- test: Remove tooltip example from outside lib [\#323](https://github.com/shipshapecode/tether/pull/323) ([chuckcarpenter](https://github.com/chuckcarpenter))
- Bump sinon from 7.4.2 to 7.5.0 [\#322](https://github.com/shipshapecode/tether/pull/322) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump @babel/core from 7.6.0 to 7.6.2 [\#321](https://github.com/shipshapecode/tether/pull/321) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Bump @babel/preset-env from 7.6.0 to 7.6.2 [\#320](https://github.com/shipshapecode/tether/pull/320) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
- Remove classes on destroy [\#316](https://github.com/shipshapecode/tether/pull/316) ([rwwagner90](https://github.com/rwwagner90))
- Bump rollup from 1.21.3 to 1.21.4 [\#314](https://github.com/shipshapecode/tether/pull/314) ([dependabot-preview[bot]](https://github.com/apps/dependabot-preview))

## [v2.0.0-beta.2](https://github.com/shipshapecode/tether/tree/v2.0.0-beta.2) (2019-09-18)

[Full Changelog](https://github.com/shipshapecode/tether/compare/v2.0.0-beta.1...v2.0.0-beta.2)

## [v2.0.0-beta.1](https://github.com/shipshapecode/tether/tree/v2.0.0-beta.1) (2019-09-18)

[Full Changelog](https://github.com/shipshapecode/tether/compare/v2.0.0-beta.0...v2.0.0-beta.1)

## [v2.0.0-beta.0](https://github.com/shipshapecode/tether/tree/v2.0.0-beta.0) (2019-09-18)

[Full Changelog](https://github.com/shipshapecode/tether/compare/v1.4.7...v2.0.0-beta.0)

**Breaking changes:**

- Remove dist from git [\#311](https://github.com/shipshapecode/tether/pull/311) ([rwwagner90](https://github.com/rwwagner90))
- Move class utils to a utils file, drop IE9 support [\#310](https://github.com/shipshapecode/tether/pull/310) ([rwwagner90](https://github.com/rwwagner90))

**Implemented enhancements:**

- Return `this` in Evented class for easy chaining [\#309](https://github.com/shipshapecode/tether/pull/309) ([rwwagner90](https://github.com/rwwagner90))
- Add `allowPositionFixed` optimization option [\#308](https://github.com/shipshapecode/tether/pull/308) ([rwwagner90](https://github.com/rwwagner90))

**Closed issues:**

- Transferring ownership [\#303](https://github.com/shipshapecode/tether/issues/303)
- No test cases to run the package [\#293](https://github.com/shipshapecode/tether/issues/293)
- Not Compatible with TypeScript compiler [\#263](https://github.com/shipshapecode/tether/issues/263)
- dist/js/tether.min.js is outdated [\#256](https://github.com/shipshapecode/tether/issues/256)
- no version information in min.js [\#239](https://github.com/shipshapecode/tether/issues/239)

**Merged pull requests:**

- Add tests for enable/disable [\#306](https://github.com/shipshapecode/tether/pull/306) ([rwwagner90](https://github.com/rwwagner90))
- Add basic tests, sass -\> scss, gulp -\> rollup, etc [\#305](https://github.com/shipshapecode/tether/pull/305) ([rwwagner90](https://github.com/rwwagner90))
- Fix code example in README.md [\#216](https://github.com/shipshapecode/tether/pull/216) ([Stanton](https://github.com/Stanton))
- Add reactstrap to examples of projects using tether [\#211](https://github.com/shipshapecode/tether/pull/211) ([eddywashere](https://github.com/eddywashere))

## v1.3.0
- Tether instances now fire an 'update' event when attachments change due to constraints (#119)

## v1.0.1
- Update arrow mixin to change arrow pointer event


## v1.0.0
- Coffeescript -> ES6
- Proper UMD Wrapper
- Update build steps
- Add changelog
- Provide minified CSS


\* *This Changelog was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*
